import * as assert from 'assert'
import { chinese } from '../pinyin'

describe('chinese', () => {
  it('"了" issue', () => {
    assert.strictEqual(chinese('shou3 ma2 le'), '手麻叻')
  })
  it('"姐" issue', () => {
    assert.strictEqual(chinese('zuǒ bian zhè ge kàn bào zhì de nǚ hái zi shì nǐ jiě jie ma'), '左边浙哥瞰报制地女孩子是你姐接吗')
  })
})