#### pinyin helper library on top of the great [hanzi](https://hanzijs.com) library

### Usage:

```js
import { start, pinyin, tolerant, chinese } from '@wohui/pinyin'

start()
console.log(pinyin('汪峰老师！我是从小听着您的歌长大的~', 'num'))
//-> Wang1 feng1 lao3 shi1 ！ wo3 shi4 cong2 xiao3 ting1 zhao1 nin2 de5 ge1 zhang3 da4 de5 ~

console.log(pinyin('汪峰老师！我是从小听着您的歌长大的~', 'tone'))
//-> Wāng fēng lǎo shī ！ wǒ shì cóng xiǎo tīng zhāo nín de gē zhǎng dà de ~

console.log(tolerant('中国人行', 'zhong1 guo2 ren2 xing2'))
//-> true

console.log(tolerant('中国人行', 'zhong1 guo2 ren2 hang2'))
//-> true
  
console.log(chinese('mei3 guo2 fu4 gong1 you2 xing2'))
//-> 美国复公由行

```