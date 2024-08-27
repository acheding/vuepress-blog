最近的任务之一是爬取[中国网](http://query.china.com.cn/query/cn.html?kw=%E6%8A%BD%E6%B0%B4%E8%93%84%E8%83%BD# "中国网")的行业训练语料，搜索众多关键词下的文章，并将每篇文章的内容保存一份 TXT 和 PDF 。

### 一、Selenium

传统的写法，大抵是用 Selenium 去访问每篇文章的网址，获取正文内容保存 TXT，调用浏览器打印机将网页另存为 PDF。起先我也如此，然而对于仅仅“能源”关键词就有 12w 条数据的网站来说，在频繁打开网页和浏览器打印机的作用下，速度始终太慢，而且经过尝试，唯一的提速手段打开无头模式后台执行也因为会导致无法正常保存 PDF 而被舍弃。

```python
settings = {
	"recentDestinations": [{
			"id": "Save as PDF",
			"origin": "local",
			"account": ""
		}],
	"selectedDestinationId": "Save as PDF",
	"version": 2,
	"isHeaderFooterEnabled": True,
	"isCssBackgroundEnabled": True,
	"mediaSize": {
		"height_microns": 297000,
		"name": "ISO_A4",
		"width_microns": 210000,
		"custom_display_name": "A4",
	},
}
prefs = {
	'printing.print_preview_sticky_settings.appState': json.dumps(settings),
	'savefile.default_directory': self.path,
	"download.default_directory": self.path,
	"download.prompt_for_download": False,
	"plugins.always_open_pdf_externally": True,
	# "profile.managed_default_content_settings.images": 2,
}
self.options.add_argument('--kiosk-printing')
self.options.add_experimental_option('prefs', prefs)
# self.options.add_argument("--headless") // 无头模式
self.options.add_argument("--window-size=1920,1080")
self.driver = webdriver.Chrome(options=self.options)
self.driver.maximize_window()
```

### 二、requests+Beautiful Soup+pdfkit

本着“机器不用看页面”的思想，想到了第 2 种方案：通过接口调用得到数据，解析网址获取正文。那 PDF 该如何保存呢？就在这时，一个名为 pdfkit 的库映入眼帘，可以通过网址、文件、字符串等直接生成 PDF，真是恰好一举两得。

中国网链接前缀：http://query.china.com.cn/news/queryFn?pagetag=1&noFields=channel&nokws=2&fetch=title%2Curl&pageSize=1000&index=cn%2Cmarket_index
需要代入的变量：kw(关键词)、startPage(当前页数)、\_(当前时间戳)、pageSize(每页数据条数，这里固定 1000)

**整体思想**：循环遍历关键词，将每个关键词代入到 URL 链接中，遍历每页返回的 1000 条数据，遍历完成后 startPage 自增 1，如果返回的数据小于 1000 条，则说明是最后一页，这时进入下一个关键词，startPage 重置为 1，如果关键词遍历完成，则退出程序。过程中捕获异常，打印和保存错误信息，异常退出时重启，并从上次错误的下一条开始。

#### 1.全局变量

```python
over = False # 退出程序的标志
word_index = 0 # 关键词索引
startPage = 1 # 当前页数
news_index = 0 # 数据索引
pageCount = 1 # 总页数，打印信息用
recordCount = 0 # 总数居条数，打印信息用
```

#### 2.初始化

计划为每个关键词新建一个文件夹，所以初始化了 first_path 和 second_path 两个变量。
pdfkit 依赖 wkhtmltopdf 插件，需要提供插件的地址，当然也可以写进系统环境变量。

```python
def __init__(self):
    self.target_url = 'http://query.china.com.cn/news/queryFn?pagetag=1&noFields=channel&nokws=2&fetch=title%2Curl&pageSize=1000&index=cn%2Cmarket_index'
    self.article_url = ""  # 每篇文章的地址
    self.key_words = ["抽水蓄能", "抽蓄", "储能", "光伏", "风电", "能源", "水利", "水电",
                      "工程", "城乡建设", "城市规划", "交通规划", "基础设施", "水务", "水资源", "水网", "土壤修复"]
    self.first_path = r"D:\spiders\中国网"
    self.second_path = ""
    self.path_wk = r'E:\wkhtmltopdf\bin\wkhtmltopdf.exe'
    self.config = pdfkit.configuration(wkhtmltopdf=self.path_wk)
    self.options = {
        'encoding': 'utf-8',
        "enable-local-file-access": True
    }
```

#### 3.核心主函数

```python
def get_html(self):
    global over, word_index, startPage, pageCount, recordCount
    if not os.path.exists(self.first_path):  # 没有一级目录就新建
        os.makedirs(self.first_path)
    for i, word in enumerate(self.key_words[word_index:]):
        self.second_path = os.path.join(self.first_path, word)
        if not os.path.exists(self.second_path):  # 没有二级目录就新建
            os.makedirs(self.second_path)
        while True:
            kw = word
            _ = int(time() * 1000)  # 生成当前时间戳
            whole_url = self.target_url + f'&startPage={startPage}&kw={kw}&_={_}'
            print(whole_url)
            res = requests.get(whole_url)
            if res.status_code == 200:
                res = json.loads(res.text[9:-2])
                pageCount = res['pageCount']
                recordCount = res['recordCount']
                recordList = res['recordList']
                self.save_file(recordList)
                if startPage == pageCount:  # 最后一页操作完
                    word_index += 1
                    startPage = 1
                    pageCount = 1
                    recordCount = 0
                    break
                else:
                    startPage += 1
            else:
                print(f"请求失败，状态码：{res.status_code}")
                sleep(3)

    if word_index == len(self.key_words): # 最后一个关键词遍历完，终止循环
        over = True
```

#### 4.保存文件主函数

```python
def save_file(self, list):
    global news_index
    for i, item in enumerate(list):
        if i < news_index:  # 去除标题中的特殊符号
            continue
        title = re.sub(r'<[^>]+>|[\/:*?"<>|]|\n', '', item['title'])  # 去除标题中的特殊符号
        self.article_url = item['url']
        path = os.path.join(self.second_path, f"{title}")
        try:
            self.url_to_text_and_pdf(path)
        except Exception as e:
            print(f"保存文件失败：{e}")
            with open(os.path.join(self.second_path, 'error.txt'), 'a', encoding='utf-8') as file:
                file.write(
                    f"Message: {e}\nTime: {datetime.now()}, Word: {self.key_words[word_index]}, PageIndex: {startPage}, "
                    f"newsIndex: {news_index}, Title: {title}, URL: {self.article_url}\n")
        finally:
            news_index += 1
            print(
                f"关键词: {self.key_words[word_index]}, {startPage}/{pageCount}页, {1000 * (startPage - 1) + news_index}/{recordCount}条, {title}, {self.article_url}")
    news_index = 0
```

#### 5.保存 TXT 和 PDF

**面临问题**：对于中国网网站上搜索到的内容，来自于其一级域名下众多二级域名官网的文章，大到央视新闻、新华社，小到六盘水日报等，每篇文章的网站不同、结构不同，一个爬虫程序通常只是为了某个网站而诞生，对于错综复杂的中国网上的文章有点棘手。
**解决方法**：遍历每篇文章 DOM 上所有节点，累加每个标签的文本长度，找到文本内容最多的那个标签的父节点，然后遍历该父节点下所有子节点的文本。
![](https://zhang.beer/static/images/save-file-faster-1.png)

**面临问题**：虽说这样速度提升了不少，但是还是不够快，主要在于网站中杂余信息太多，导致 PDF 太大。
**解决方法**：前面提到 pdfkit 可以通过网址转 PDF，即将网站整份保存 PDF，其效果和 Selenium 类似，另外一种方式就是通过字符串转 PDF，将 Beautiful Soup 的 prettify()方法得到的标准 HTML 字符串按需截取，保留正文部分，然后转成 PDF 保存，这样不仅内容精简干练，而且也因为文件体积小加快了程序的执行，二者对比图如下。
![](https://zhang.beer/static/images/save-file-faster-2.png)
![](https://zhang.beer/static/images/save-file-faster-3.png)
![](https://zhang.beer/static/images/save-file-faster-4.png)

```python
def url_to_text_and_pdf(self, path):
    if not os.path.exists(f"{path}.txt") and not os.path.exists(f"{path}.pdf"):
        try:
            result = requests.get(self.article_url)
            if result.status_code != 200:
                raise Exception(f"请求失败, 状态码: {result.status_code}")
        except Exception as e:
            raise Exception(f"URL无法访问: {e}")
        if not os.path.exists(f"{path}.txt"):
            try:
                tags = self.get_all_tag(result)  # 调用下方第1个方法
                content = tags[0].text + '\n' + tags[1].text + tags[2].text + '\n' + self.get_text(tags[3])  # 调用下方第3个方法
                with open(f"{path}.txt", "w", encoding="utf-8") as file:
                    file.write(content)
            except Exception as e:
                raise Exception(f"保存TXT异常: {e}")
        if not os.path.exists(f"{path}.pdf"):
            try:
                content_prettify = tags[0].prettify() + tags[1].prettify() + tags[2].prettify()  # 将标题、时间、正文转成标准HTML字符串并合并
                tags[0].decompose()  # 部分网站标题、时间、来源包含在正文标签中，所以移除掉这三者后再合并正文
                tags[1].decompose()
                tags[2].decompose()
                content_prettify += tags[3].prettify()
                pdfkit.from_string(content_prettify, f"{path}.pdf", configuration=self.config,
                                   options=self.options)
            except Exception as e:
                raise Exception(f"保存PDF异常: {e}")
```

##### 1.获取标题、时间、来源、正文的 TAG

```python
def get_all_tag(self, result):
    soup = BeautifulSoup(result.content, 'lxml')  # lxml解析相较html.paser更快
    comments = soup.findAll(string=lambda text: isinstance(text, Comment))  # 删除DOM中的注释
    [comment.extract() for comment in comments]
    title_tag = soup.find('h1') or Tag(name='div')  # 经观察，各个网站的标题都是h1
    time_pattern = re.compile(r'\d{4}-\d{2}-\d{2}')
    source_pattern = re.compile(r"来源")
    time_tag = soup.find(string=time_pattern) or Tag(name='div')  # 匹配发布时间
    if isinstance(time_tag, str):  # 如果是纯字符串，找到它的父节点，便于后面处理PDF时保留格式
        time_tag = time_tag.parent
    source_tag = soup.find(string=source_pattern) or Tag(name='div')  # 查找发布来源
    if isinstance(source_tag, str):
        source_tag = source_tag.parent
    if time_tag == source_tag:  # 部分网站时间和来源位于同一个标签内
        source_tag = Tag(name='div')
    article_tag = self.get_max_tag_parent(soup)  # 调用下方第2个方法，找到正文的标签
    for tag in article_tag.find_all():  # 将正文中所有的相对地址改为绝对地址
        if 'src' in tag.attrs and not tag['src'].startswith('http'):
            tag['src'] = urljoin(self.article_url, tag['src'])
    vedio_tag = article_tag.find(id="videoarea")
    if vedio_tag and not vedio_tag.contents:  # 这里发现部分网站预留了一个“display: none”的视频块，转成PDF时会出现空白，如果其中没有视频就将它移除
        vedio_tag.decompose()
    return [title_tag, time_tag, source_tag, article_tag]
```

##### 2.获取最长文本的标签的父节点

```python
def get_max_tag_parent(self, soup):
    max_length = 0
    max_tag = None
    white_tag = ["script", "style", "meta", "link", "head", "title", "html", "body", "img", "video"]  # 过滤的白名单
    for tag in soup.find_all():
        if tag.name in white_tag:
            continue
        if tag.string:
            text_length = len(tag.string.strip())
            if text_length > max_length:
                max_length = text_length
                max_tag = tag
    return max_tag.parent
```

##### 3.获取正文文本

```python
def get_text(self, tag):
    result = ""
    for child in tag.contents:
        if isinstance(child, str):
            result += child
        elif 'src' in child.attrs:
            result += child['src']  # 如果是图片视频等，获取它的地址
        else:
            result += self.get_text(child)  # 递归获取子节点文本并拼接
    return result.strip() + '\n'
```