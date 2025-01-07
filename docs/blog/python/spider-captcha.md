# Python 爬虫验证码识别

在我们进行爬虫的过程中，经常会碰到有些网站会时不时弹出来验证码识别。我们该如何解决呢？这里分享 2 种我尝试过的方法。
![spider-captcha-1](https://zhang.beer/static/images/spider-captcha-1.png)

## 0.验证码示例

![spider-captcha-example](https://zhang.beer/static/images/spider-captcha-example.png)

## 1.OpenCV + pytesseract

使用 Python 中的 OpenCV 库进行图像预处理（边缘保留滤波、灰度化、二值化、形态学操作和逻辑运算），然后结合 pytesseract 进行文字识别。

pytesseract 需要配合安装在本地的 tesseract-ocr.exe 文件一起使用，tesseract-ocr.exe 安装教程可参考这里：[Tesseract Ocr 文字识别](https://github.com/vipstone/faceai/blob/master/doc/tesseractOCR.md)，

### 1.1 代码

```python

import cv2 as cv
import pytesseract
from PIL import Image


def recognize_text(image):
    # 边缘保留滤波  去噪
    blur =cv.pyrMeanShiftFiltering(image, sp=8, sr=60)
    cv.imshow('dst', blur)
    # 灰度图像
    gray = cv.cvtColor(blur, cv.COLOR_BGR2GRAY)
    # 二值化
    ret, binary = cv.threshold(gray, 0, 255, cv.THRESH_BINARY_INV | cv.THRESH_OTSU)
    print(f'二值化自适应阈值：{ret}')
    cv.imshow('binary', binary)
    # 形态学操作  获取结构元素  开操作
    kernel = cv.getStructuringElement(cv.MORPH_RECT, (3, 2))
    bin1 = cv.morphologyEx(binary, cv.MORPH_OPEN, kernel)
    cv.imshow('bin1', bin1)
    kernel = cv.getStructuringElement(cv.MORPH_OPEN, (2, 3))
    bin2 = cv.morphologyEx(bin1, cv.MORPH_OPEN, kernel)
    cv.imshow('bin2', bin2)
    # 逻辑运算  让背景为白色  字体为黑  便于识别
    cv.bitwise_not(bin2, bin2)
    cv.imshow('binary-image', bin2)
    # 识别
    test_message = Image.fromarray(bin2)
    text = pytesseract.image_to_string(test_message)
    print(f'识别结果：{text}')


src = cv.imread(r'./spider-captcha-example.png')
cv.imshow('input image', src)
recognize_text(src)
cv.waitKey(0)
cv.destroyAllWindows()

```

### 1.2 效果

![spider-captcha-2](https://zhang.beer/static/images/spider-captcha-2.png)

可以看到，由于验证码背景的干扰，效果并不是很理想。

## 2.muggle_ocr

muggle_ocr 是一款轻量级的 ocr 识别库，使用非常简单，其强项主要是用于识别各类验证码。

### 2.1 代码

```python

import cv2 as cv
import pytesseract
from PIL import Image


import muggle_ocr

sdk = muggle_ocr.SDK(model_type=muggle_ocr.ModelType.Captcha)

def recognize_text():
    with open(r'./spider-captcha-example.png', "rb") as f:
        image_binary = f.read()
        text = sdk.predict(image_bytes=image_binary)
        print(f'识别结果：{text}')

recognize_text()

```

### 2.2 效果

![spider-captcha-3](https://zhang.beer/static/images/spider-captcha-3.png)

可以看到，效果十分显著，成功率十分高。

## 3.自动填写验证码

某些网站的验证码时时刻刻会发生变化，我们无法通过验证码的 URL 去访问验证码图片。

需要另辟蹊径，采用截图的方式保存包含验证码的一屏图。
然后通过坐标裁剪目标区域的验证码，使用 muggle_ocr 的 predict 方法识别裁剪后的图片。
将识别结果填入输入框，点击确定。
DOM 结构见首图。

```python
sdk = muggle_ocr.SDK(model_type=muggle_ocr.ModelType.Captcha)

def recognize_text(self):
    try:
        myModal = self.driver.find_element(By.XPATH, '//div[@id="myModal"]')
        captcha = myModal.find_element(By.XPATH, './div/div/div[2]/img')
        captcha_path = os.path.join(self.path, f'captcha.png')
        self.driver.save_screenshot(captcha_path)  # 截取当前窗口并保存图片
        im = Image.open(captcha_path)  # 打开截图
        im = im.crop((772, 103, 869, 143))  # 裁剪截图获取验证码
        im.save(captcha_path) # 保存裁剪后图片
        with open(captcha_path, "rb") as f:
            image_binary = f.read()
            text = self.sdk.predict(image_bytes=image_binary)
            myModal.find_element(By.XPATH, './div/div/div[2]/input[@id="verifyCode"]').send_keys(text) # 将识别结果填入输入框
            myModal.find_element(By.XPATH, './div/div/div[3]/button[2]').click() # 点击确定按钮
            try:
                sleep(0.5)
                alert = self.driver.switch_to.alert # 验证码输入错误的弹窗
                print(f"{text}，验证码输入错误，重新尝试中...")
                alert.accept() # 点击弹窗的确认按钮关闭弹窗
                captcha.click() # 点击验证码进行刷新
                self.recognize_text()
            except NoAlertPresentException: # 如果没有弹窗出现，表明验证码输入正确
                print(f"{text}，验证码输入正确")
    except Exception as e:
        raise Exception(f"验证码识别错误: {e}")
```
