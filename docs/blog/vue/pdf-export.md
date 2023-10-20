# Vue 实现 PDF 导出功能

旨在通过 html2canvas 和 jspdf，先将页面的 html 转成 canvas，再将 canvas 转成 pdf，同时解决了分页截断的问题。

## 安装依赖

```
yarn add html2canvas
yarn add jspdf
```

## 思路

通过网上的一些教程，初步实现了 html 转 pdf 的功能，将一整个 DOM 元素放进去，虽然可以粗糙实现，但是出现了很多地方被分页截断的情况，这个时候就需要在某一张图片被截断时，将其自动切换到下一页中。

### 1.拆解父节点

所以第一步：拆解父节点，一行一行细分为很多子节点，循环遍历这些子节点，累加这些子节点的高度，如果超出了 a4 纸（210\*297）的高度，则分页。

::: details 点击查看代码

```js
import html2Canvas from "html2canvas";
import JsPDF from "jspdf";

export function oneNodeMultipleChildren(title, node) {
  html2Canvas(node, {
    scale: 2, // 清晰度
  }).then(function (canvas) {
    let PDF = new JsPDF("", "mm", "a4"); // 以mm为单位
    let position = 0; // 页面偏移
    let contentWidth = canvas.width; // 转换成canvas后的宽度
    let contentHeight = canvas.height; // 转换成canvas后的高度
    let proportion = 210 / node.offsetWidth; // html缩小至a4纸大小时的比例
    let currentHeight = 0; // 当前高度
    let imgWidth = 210; // canvas缩小至a4纸大小时的宽度
    let imgHeight = (210 / contentWidth) * contentHeight; // canvas缩小至a4纸大小时的高度
    let pageData = canvas.toDataURL("image/jpeg", 1.0); // 将canvas转成图片

    for (let j = 0; j < node.children.length; j++) {
      let childHeight = (node.children[j].offsetHeight + 8) * proportion; // 页面中每行的间距 margin-bottom: 8px

      if (currentHeight + childHeight > 297) {
        // 如果加上这个子节点后内容超出a4纸高度，就从当前位置开始分页
        addImage(PDF, pageData, position, imgWidth, imgHeight, currentHeight);
        position -= currentHeight; // 这一页放了多少高度的内容，下一页就从这个高度开始偏移
        if (position >= -contentHeight) {
          PDF.addPage(); // 添加新pdf页
        }
        currentHeight = childHeight; // 下一页第一个元素的高度
      } else {
        currentHeight += childHeight;
      }
    }
    addImage(PDF, pageData, position, imgWidth, imgHeight, currentHeight); // 最后一页
    PDF.save(title + ".pdf");
  });
}

function addImage(PDF, pageData, position, imgWidth, imgHeight, currentHeight) {
  PDF.addImage(pageData, "JPEG", 0, position, imgWidth, imgHeight); // 在当前pdf页添加图片
  PDF.setFillColor(255, 255, 255); // 遮挡的颜色
  PDF.rect(0, currentHeight, 210, Math.ceil(297 - currentHeight), "F"); // 添加空白遮挡
  // PDF.rect参数分别为：起始横坐标、起始纵坐标、绘制宽度、绘制高度、填充色
}
```

:::

### 2.合并父节点

经过上述步骤，一个父节点多个子节点，并且每个子节点独占一行的布局可以实现分页，那要是有很多父节点呢？就需要遍历每个父节点，合并所有子节点，进行分页截断。

::: details 点击查看代码

```js
import html2Canvas from "html2canvas";
import JsPDF from "jspdf";

export function exportPdf(title, id) {
  let content = document.querySelector(`#${id}`);
  let first = content.firstElementChild.firstElementChild;
  let second = content.lastElementChild;
  oneNodeMultipleChildren(title, content, [first, second]);
}

export function oneNodeMultipleChildren(title, content, nodes) {
  html2Canvas(content, {
    scale: 2,
  }).then(function (canvas) {
    let PDF = new JsPDF("", "mm", "a4");
    let position = 0;
    let contentWidth = canvas.width;
    let contentHeight = canvas.height;
    let proportion = 200 / content.offsetWidth;
    let currentHeight = 0;
    let imgWidth = 200;
    let imgHeight = (200 / contentWidth) * contentHeight;
    let pageData = canvas.toDataURL("image/jpeg", 1.0);

    for (let i = 0; i < nodes.length; i++) {
      // 根据传入的父节点数量进行循环，遍历父节点，合并所有子节点
      for (let j = 0; j < nodes[i].children.length; j++) {
        let childHeight = (nodes[i].children[j].offsetHeight + 8) * proportion;

        if (currentHeight + childHeight > 287) {
          addImage(PDF, pageData, position, imgWidth, imgHeight, currentHeight);
          position -= currentHeight;
          if (position >= -contentHeight) {
            PDF.addPage();
          }
          currentHeight = childHeight;
        } else {
          currentHeight += childHeight;
        }
      }
    }
    addImage(PDF, pageData, position, imgWidth, imgHeight, currentHeight);
    PDF.save(title + ".pdf");
  });
}

function addImage(PDF, pageData, position, imgWidth, imgHeight, currentHeight) {
  PDF.addImage(pageData, "JPEG", 0, position, imgWidth, imgHeight); // 在当前pdf页添加图片
  PDF.setFillColor(255, 255, 255); // 遮挡的颜色
  PDF.rect(0, currentHeight, 210, Math.ceil(297 - currentHeight), "F"); // 添加空白遮挡
}
```

:::

### 3.每行多个元素

这个时候新的问题出现了，由于页面布局为 flex 布局，不同缩放下，每行的元素数量会出现变化。所以我们获取第一个子元素与 a4 纸宽度关系，如果为 n 倍，那后面 n-1 个子元素的高度不进行累加。

::: warning 注意
这里只解决了一行 n 个子元素宽度相等，且近似等于 a4 纸宽度的 1/n 的情况。
:::

::: details 点击查看代码

```js
import html2Canvas from "html2canvas";
import JsPDF from "jspdf";

export function exportAssetPdf(title, id) {
  let content = document.querySelector(`#${id}`);
  let first = content.firstElementChild.firstElementChild;
  let second = content.lastElementChild;
  oneNodeMultipleChildren(title, content, [first, second]);
}

export function oneNodeMultipleChildren(title, content, nodes) {
  html2Canvas(content, {
    scale: 2,
  }).then(function (canvas) {
    let PDF = new JsPDF("", "mm", "a4");
    let position = 0;
    let contentWidth = canvas.width;
    let contentHeight = canvas.height;
    let proportion = 200 / content.offsetWidth;
    let currentHeight = 0;
    let imgWidth = 200;
    let imgHeight = (200 / contentWidth) * contentHeight;
    let pageData = canvas.toDataURL("image/jpeg", 1.0);
    let sameIndex = 1;
    let widthX = 1;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes[i].children.length; j++) {
        let childHeight = (nodes[i].children[j].offsetHeight + 8) * proportion;
        let childWidth = nodes[i].children[j].offsetWidth * proportion;
        if (sameIndex === 1) {
          widthX = Math.round(200 / childWidth);
        }
        if (sameIndex < widthX) {
          childHeight = 0;
          sameIndex++;
        } else {
          sameIndex = 1;
        }

        if (currentHeight + childHeight > 287) {
          addImage(PDF, pageData, position, imgWidth, imgHeight, currentHeight);
          position -= currentHeight;
          if (position >= -contentHeight) {
            PDF.addPage();
          }
          currentHeight = childHeight;
        } else {
          currentHeight += childHeight;
        }
      }
    }
    addImage(PDF, pageData, position, imgWidth, imgHeight, currentHeight);
    PDF.save(title + ".pdf");
  });
}

function addImage(PDF, pageData, position, imgWidth, imgHeight, currentHeight) {
  PDF.addImage(pageData, "JPEG", 0, position, imgWidth, imgHeight); // 在当前pdf页添加图片
  PDF.setFillColor(255, 255, 255); // 遮挡的颜色
  PDF.rect(0, currentHeight, 210, Math.ceil(297 - currentHeight), "F"); // 添加空白遮挡
}
```

:::

### 4.添加左右间距和页眉页脚

为了美化 pdf 布局，上下左右留白，就需要添加左右间距和页眉页脚：减少 html 缩小至 a4 纸大小时的比例和 canvas 缩小至 a4 纸大小时宽高，增加偏移量，并对页眉页脚进行空白遮挡。

::: details 点击查看代码

```js
import html2Canvas from "html2canvas";
import JsPDF from "jspdf";

export function exportAssetPdf(title, id) {
  let content = document.querySelector(`#${id}`);
  let first = content.firstElementChild.firstElementChild;
  let second = content.lastElementChild;
  oneNodeMultipleChildren(title, content, [first, second]);
}

export function oneNodeMultipleChildren(title, fNode, sNode) {
  html2Canvas(fNode, {
    scale: 2,
  }).then(function (canvas) {
    let PDF = new JsPDF("", "mm", "a4");
    let position = 0;
    let contentWidth = canvas.width;
    let contentHeight = canvas.height;
    let proportion = 200 / fNode.offsetWidth; // 减少10mm
    let currentHeight = 0;
    let imgWidth = 200; // 减少10mm
    let imgHeight = (200 / contentWidth) * contentHeight; // 减少10mm
    let pageData = canvas.toDataURL("image/jpeg", 1.0);
    let sameIndex = 1;
    let widthX = 1;

    for (let i = 0; i < sNode.length; i++) {
      for (let j = 0; j < sNode[i].children.length; j++) {
        let childHeight = (sNode[i].children[j].offsetHeight + 8) * proportion;
        let childWidth = sNode[i].children[j].offsetWidth * proportion;
        if (sameIndex === 1) {
          widthX = Math.round(200 / childWidth); // 减少10mm
        }
        if (sameIndex < widthX) {
          childHeight = 0;
          sameIndex++;
        } else {
          sameIndex = 1;
        }

        if (currentHeight + childHeight > 287) {
          // 减小10mm
          addImage(PDF, pageData, position, imgWidth, imgHeight, currentHeight);
          position -= currentHeight;
          if (position >= -contentHeight) {
            PDF.addPage();
          }
          currentHeight = childHeight;
        } else {
          currentHeight += childHeight;
        }
      }
    }
    addImage(PDF, pageData, position, imgWidth, imgHeight, currentHeight);
    PDF.save(title + ".pdf");
  });
}

function addImage(PDF, pageData, position, imgWidth, imgHeight, currentHeight) {
  PDF.addImage(pageData, "JPEG", 5, position + 5, imgWidth, imgHeight); // 增加偏移量
  PDF.setFillColor(255, 255, 255);
  PDF.rect(0, 0, 210, 4, "F"); // 添加页眉遮挡
  PDF.rect(0, currentHeight + 5, 210, Math.ceil(292 - currentHeight), "F"); // 添加页脚遮挡
}
```

:::

## 成果展示

不同缩放下导出 PDF 对比：

[每行一个子元素](https://zhang.beer/static/images/export-pdf-1.pdf)

[每行多个子元素](https://zhang.beer/static/images/export-pdf-2.pdf)
