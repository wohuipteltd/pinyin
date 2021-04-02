import * as assert from 'assert'
import { tolerant } from '../pinyin'

describe('toleranț', () => {
  it('爪子', () => {
    assert.ok(tolerant('爪子', 'zhua3 zi1'))
    assert.ok(!tolerant('爪子', 'zhao3 zi1'))
    assert.ok(tolerant('爪子', 'zhuǎ zǐ'))
    assert.ok(!tolerant('爪子', 'zhǎo zi'))
  })
})