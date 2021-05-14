import * as assert from 'assert'
import { pinyin, numeric_tones, tone2num, valid_phone } from '../pinyin'
import * as hanzi from 'hanzi'

describe('pinyin', () => {
  it('nǚ', () => {
    assert.deepStrictEqual(pinyin('nu:3', 'tone'), 'nǚ')
    assert.deepStrictEqual(pinyin('nv3', 'tone'), 'nǚ')
    assert.deepStrictEqual(numeric_tones('nǚ'), [['nv', 3]])
    assert.deepStrictEqual(pinyin('女', 'tone'), 'nǚ')
    assert.deepStrictEqual(numeric_tones('nǚ rén'), [['nv', 3], ['ren', 2]])
  })

  it('说', () => {
    assert.deepStrictEqual(pinyin('说', 'tone'), 'shuō')
  })

  it('single pinyin issues', () => {
    assert.deepStrictEqual(pinyin('什', 'num'), 'shen2')
    assert.deepStrictEqual(pinyin('么', 'num'), 'me5')
    assert.deepStrictEqual(pinyin('足', 'num'), 'zu2')
    assert.deepStrictEqual(pinyin('校', 'num'), 'xiao4')
    assert.deepStrictEqual(pinyin('吗', 'num'), 'ma5')
  })

  it('valid_phone', () => {
    // assert.deepStrictEqual(valid_phone('chi'), true)
    assert.deepStrictEqual(valid_phone('zi'), true)
    assert.deepStrictEqual(valid_phone('zhi'), true)
  })

  it('compond', () => {
    assert.deepStrictEqual(pinyin('yǒu yi1说yī', 'num'), 'you3 yi1 shuo1 yi1')
    assert.deepStrictEqual(pinyin('yǒu yi1说yī', 'tone'), 'yǒu yī shuō yī')
  })

  it('爸爸深深的爱着我们', () => {
    assert.deepStrictEqual(pinyin('爸爸深深的爱着我们', 'tone'), 'bà ba shēn shēn de ài zhe wǒ men')
    assert.deepStrictEqual(pinyin('着火了快跑啊', 'tone'), 'zháo huǒ le kuài pǎo ā')
    assert.deepStrictEqual(pinyin('着急上火也没用', 'tone'), 'zháo jí shàng huǒ yě méi yòng')
  })

  it('yi1 zhi1 mao1', () => {
    assert.deepStrictEqual(pinyin('yi1 zhi1 mao1', 'num'), 'yi1 zhi1 mao1')
    assert.deepStrictEqual(pinyin('yi1 zhi1 mao1', 'num'), 'yi1 zhi1 mao1')
    assert.deepStrictEqual(tone2num(tone2num('yī zhī māo')), 'yi1 zhi1 mao1')
  })

  it('ni3', () => {
    assert.deepStrictEqual(pinyin('你', 'num'), 'ni3')
    assert.deepStrictEqual(tone2num('nǐ'), 'ni3')
  })
})