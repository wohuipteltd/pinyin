import * as assert from 'assert'
import { pinyin, numeric_tones, tone2num } from '../pinyin'

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