import { PinyinHelper, PinyinFormat } from 'pinyin4js/lib/PinyinHelper'
import { mutil_pinyin_dict as multi_pinyin_dict } from 'pinyin4js/lib/dict/mutil_pinyin.dict'
const pinyin_to_chinese_dict: { [key: string]: string[] } = {}
import * as _ from 'lodash'
import * as hanzi from 'hanzi'

const PinyinRegexp = /([A-Za-züēéěèāīōūǖáíóúǘǎǐǒǔǚàìòùǜńňǹ][A-Za-züēéěèāīōūǖáíóúǘǎǐǒǔǚàìòùǜńňǹ0-9]*)/g
const ChineseRegexp = /([\u4e00-\u9fa5]|[A-Za-züēéěèāīōūǖáíóúǘǎǐǒǔǚàìòùǜńňǹ][A-Za-züēéěèāīōūǖáíóúǘǎǐǒǔǚàìòùǜńňǹ0-9]*)/g

multi_pinyin_dict["假期"] = "jià,qī"

PinyinHelper.addMutilPinyinDictResource({
  "校长": "xiào,zhǎng",
  "村长": "cūn,zhǎng",
  "园长": "yuán,zhǎng",
  "家长": "jiā,zhǎng",
  "年长": "nián,zhǎng",
  "嗯": "ń",
  "哪儿": "nǎ 'er",
  "这儿": "zhè-er",
  "长大": "zhǎng,dà",
  "哥哥": "gē,ge",
  "弟弟": "dì,di",
  "妈妈": "mā,ma",
  "爸爸": "bà,ba",
  "爷爷": "yé,ye",
  "奶奶": "nǎi,nai",
  "姐姐": "jiě,jie",
  "姥姥": "lǎo,lao",
  "长的": "zhǎng,de",
  "快点儿": "kuài,diǎn,r",
  "饭馆儿": "fàn,guǎn,r",
  "天儿": "tiān,r",
  "对不起": "duì,bu,qǐ",
  "太行山": "tài,háng,shān",
  "牛仔日": "niú,zǎi,rì",
  "牛仔": "niú,zǎi",
  "睡觉": "shuì,jiào"
})

PinyinHelper.addPinyinDictResource({
  '谁': 'shuí,shéi'
})
// pinyin_dict['谁'] = 'shuí,shéi'
// pinyin_dict['么'] = 'me'
export const PinyinTypes = {
  tone: PinyinFormat.WITH_TONE_MARK,
  outtone: PinyinFormat.WITHOUT_TONE,
  num: PinyinFormat.WITH_TONE_NUMBER,
  head: PinyinFormat.FIRST_LETTER
}

const vowels = {
  'üē': ['ve', 1],
  'üé': ['ve', 2],
  'üě': ['ve', 3],
  'üè': ['ve', 4],
  'ā': ['a', 1],
  'ē': ['e', 1],
  'ī': ['i', 1],
  'ō': ['o', 1],
  'ū': ['u', 1],
  'ǖ': ['v', 1],
  'á': ['a', 2],
  'é': ['e', 2],
  'í': ['i', 2],
  'ó': ['o', 2],
  'ú': ['u', 2],
  'ǘ': ['v', 2],
  'ǎ': ['a', 3],
  'ě': ['e', 3],
  'ǐ': ['i', 3],
  'ǒ': ['o', 3],
  'ǔ': ['u', 3],
  'ǚ': ['v', 3],
  'à': ['a', 4],
  'è': ['e', 4],
  'ì': ['i', 4],
  'ò': ['o', 4],
  'ù': ['u', 4],
  'ǜ': ['v', 4],
  'ńg': ['en', 2],
  'ňg': ['en', 3],
  'ǹg': ['en', 4],
  'ń': ['en', 2],
  'ň': ['en', 3],
  'ǹ': ['en', 4]
}

const reverted_tone = (() => {
  const ret = {}
  Object.keys(vowels).map(key => vowels[key])
  Object.keys(vowels).forEach((key) => {
    const [no_tone, num] = vowels[key]
    if (!ret[num]) {
      ret[num] = {}
    }
    ret[num][no_tone] = key
  })
  ret[5] = { ue: 'üe', a: 'a', e: 'e', i: 'i', o: 'o', u: 'u', v: 'ü' }
  return ret
})()

const TONE_PRIORITIES = ['a', 'e', 'o', ['iu', 'u'], ['ui', 'i'], 'i', 'u', 'v']
const pinyin_separators = /[\s'-]+/
const numeric_tone_pattern = /^([a-z]+)([1-5])$/
export type NumericTone = [string, number]

const re_filter = (re: RegExp, text: string) => {
  let result = []
  text.replace(re, (match) => {
    result.push(match)
    return ''
  })
  return result
}

export const start = () => {
  console.time('pinyin_to_chinese')
  hanzi.start()
  let i = 1
  while (true) {
    const res = hanzi.getCharacterInFrequencyListByPosition(i++)
    if (res == 'Character not found') {
      break
    }
    const { character, count, pinyin } = res
    const def = hanzi.definitionLookup(character, 's')
    if (!def) {
      continue
    }
    for (const tone_num of pinyin.split('/')) {
      const [tone, num] = numeric_tone(tone_num)

      if (!pinyin_to_chinese_dict[tone]) {
        pinyin_to_chinese_dict[tone] = []
      }
      if (!pinyin_to_chinese_dict[tone][num]) {
        pinyin_to_chinese_dict[tone][num] = character
      } else {
        const f_old = hanzi.getCharacterFrequency(pinyin_to_chinese_dict[tone][num])
        if (pinyin === def.pinyin && f_old.pinyin.split('/').length > pinyin.split('/').length || Number(f_old.count) < Number(count)) {
          // if (tone == 'fa' && num == 1) {
          //   console.log('replacing', f_old, { character, count, pinyin }, def)
          // }
          pinyin_to_chinese_dict[tone][num] = character
        }
      }
    }
  }
  console.timeEnd('pinyin_to_chinese')
}

const numeric_tone = (str: string): NumericTone => {
  const m = numeric_tone_pattern.exec(str)
  if (m) {
    return [m[1], Number(m[2])]
  }
  if (str === 'r') {
    return ['er', 5]
  }
  for (const key of Object.keys(vowels)) {
    if (str.indexOf(key) !== -1) {
      const [tone, num] = vowels[key]
      return [str.replace(key, tone), num]
    }
  }
  return [str, 5]
}

export const numeric_tones = (pinyin_str: string): NumericTone[] => {  
  return pinyin_str.split(pinyin_separators).map(numeric_tone)
}

export const tolerant = (text: string, pinyin_str: string) => {
  if (Object.keys(pinyin_to_chinese_dict).length === 0) {
    start()
  }
  if (text === pinyin_str) return true
  const character_array = re_filter(ChineseRegexp, text)
  if (character_array.length === 0) return true
  const pinyin_array = re_filter(PinyinRegexp, pinyin_str).map(numeric_tone)
  if (pinyin_array.length !== character_array.length) {
    console.log(pinyin_array, character_array)
    return false
  }
  return pinyin_array.every(([tone, num], i) => {
    if (character_array[i] === tone) return true
    console.log(character_array[i], [tone, num])
    const pinyins = PinyinHelper._convertToPinyinArray(character_array[i], PinyinFormat.WITH_TONE_NUMBER)
    console.log({ pinyins })
    if (Array.isArray(pinyins)) {
      const found = pinyins.some((p: string) => {
        const [t, n] = numeric_tone(p)
        return t === tone && (n === num || num === 5)
      })
      if (!found) {
        console.log([tone, num], `doesn't match any`, pinyins)
      }
      return found
    } else {
      console.log(character_array[i], "failed to look up pinyin of");
    }
  })
}

// (() => {
//   console.log(tolerant('爸爸', 'bà ba'))
// })()

const pinyin_equal = (nts1: NumericTone[], nts2: NumericTone[]) => {
  return nts1.every(([, num], i) => nts2[i][1] === num)
}

export const random_tones = (tone_nums: NumericTone[], expected_length: number): NumericTone[][] => {
  if (Object.keys(pinyin_to_chinese_dict).length === 0) {
    start()
  }
  const possibilities = tone_nums.map(([tone, num]): [string, number[]] => {
    const nums = []
    if (pinyin_to_chinese_dict[tone]) {
      pinyin_to_chinese_dict[tone].forEach((c, available_num) => {
        nums.push(available_num)
      })
    } else {
      nums.push(...[1, 2, 3, 4, 5])
    }
    return [tone, nums]
  })
  const max_length = possibilities.reduce((length, [tone, nums]) => length * nums.length, 1) - 1
  expected_length = Math.min(expected_length, max_length)
  
  const results: NumericTone[][] = [tone_nums]
  while (results.length - 1 < expected_length) {
    const random = possibilities.map(([tone, nums]): NumericTone => [tone, _.sample(nums)])
    if (results.some(found => pinyin_equal(found, random))) continue
    results.push(random)
  }
  return results.slice(1)
}

export const revert_numeric_tone = (tone_num: NumericTone) => {
  /*有ɑ先标ɑ；  无ɑ有e或o，则先标e或o； 只有i或u/ü，则标i或u/ü；  i、u在一起，则标后一个（指韵母iu，ui）*/
  const [tone, num] = tone_num
  for (const group of TONE_PRIORITIES) {
    const sound = Array.isArray(group) ? group[0] : group
    if (tone.indexOf(sound) >= 0) {
      const replacing = Array.isArray(group) ? group[1] : group
      return tone.replace(replacing, reverted_tone[num][replacing])
    }
  }
  return tone
}

export const tonemark = (text: string) => numeric_tones(text).map(revert_numeric_tone).join(' ')

export const pinyin = (text: string, type: keyof typeof PinyinTypes) => {
  return PinyinHelper.convertToPinyinString(text, ' ', PinyinTypes[type])
}

const revert_numeric_tone_regexp = (tone_num: NumericTone) => {
  /*有ɑ先标ɑ；  无ɑ有e或o，则先标e或o； 只有i或u/ü，则标i或u/ü；  i、u在一起，则标后一个（指韵母iu，ui）*/
  const [tone, num] = tone_num
  for (const group of TONE_PRIORITIES) {
    const sound = Array.isArray(group) ? group[0] : group;
    if (tone.indexOf(sound) >= 0) {
      const replacing = Array.isArray(group) ? group[1] : group
      const pattern = [1, 2, 3, 4, 5].filter((n) => num !== n).map(num => reverted_tone[num][replacing]).join('|')
      return tone.replace(replacing, '(' + pattern + ')')
    }
  }
  return tone
}

export const numeric_tones_binary = (pinyin_str: string, binary: boolean, separator: string) => {
  return numeric_tones(pinyin_str).map(tone => {
    return binary ? revert_numeric_tone(tone) : revert_numeric_tone_regexp(tone)
  }).filter(x => x).join(separator)
}

export const chinese = (pinyin_str: string) => {
  if (Object.keys(pinyin_to_chinese_dict).length === 0) {
    start()
  }
  return numeric_tones(pinyin_str).map(([tone, num]) => {
    if (pinyin_to_chinese_dict[tone]) {
      let candidate = pinyin_to_chinese_dict[tone][num]
      if (candidate) return candidate
      for (const i of [5, 1, 2, 3, 4]) {
        candidate = pinyin_to_chinese_dict[tone][i]
        if (candidate) return candidate
      }
    }
    return pinyin_str
  }).join('')
}
