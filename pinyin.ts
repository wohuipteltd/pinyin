import * as hanzi from 'hanzi'

export const PinyinRegexp = /([A-Za-züēéěèāīōūǖáíóúǘǎǐǒǔǚàìòùǜńňǹ][A-Za-züēéěèāīōūǖáíóúǘǎǐǒǔǚàìòùǜńňǹ0-9]*)/g
const ChineseRegexp = /([\u3400-\u9fa5]|[A-Za-züēéěèāīōūǖáíóúǘǎǐǒǔǚàìòùǜńňǹ][A-Za-züēéěèāīōūǖáíóúǘǎǐǒǔǚàìòùǜńňǹ0-9]*)/g
const NoneChineseRegexp = /([^\u3400-\u9fa5]+)/g

export type NumericTone = [string, number]

type ChineseCharacter = { pinyin: number, character: string, count: number }
const pinyin_to_chinese_dict: { [key: string]: ChineseCharacter[] } = {}

const vowels: {[key: string]: NumericTone} = {
  'üē': ['ve', 1],
  'üé': ['ve', 2],
  'üě': ['ve', 3],
  'üè': ['ve', 4],
  'uē': ['ue', 1],
  'ué': ['ue', 2],
  'uě': ['ue', 3],
  'uè': ['ue', 4],
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
  'ǘ': ['v', 2],
  'ǎ': ['a', 3],
  'ě': ['e', 3],
  'ǐ': ['i', 3],
  'ǒ': ['o', 3],
  'ǔ': ['u', 3],
  'ǚ': ['v', 3], // alt + u -> u -> shift + alt + v
  'ǚ': ['v', 3], // alt + v -> v
  'à': ['a', 4],
  'è': ['e', 4],
  'ì': ['i', 4],
  'ò': ['o', 4],
  'ù': ['u', 4],
  'ǜ': ['v', 4],
  'ǜ': ['v', 4],
  'ńg': ['en', 2],
  'ňg': ['en', 3],
  'ǹg': ['en', 4],
  'ń': ['en', 2],
  'ň': ['en', 3],
  'ǹ': ['en', 4]
}

const reverted_tone = (() => {
  const ret = {}
  Object.keys(vowels).forEach((key) => {
    const [no_tone, num] = vowels[key]
    if (!ret[num]) {
      ret[num] = {}
    }
    ret[num][no_tone] = key
    if (no_tone.includes('v')) {
      ret[num][no_tone.replace('v', 'u:')] = key
    }
  })
  ret[5] = { ue: 'üe', a: 'a', e: 'e', i: 'i', o: 'o', u: 'u', v: 'ü', 'u:e': 'üe', 'u:': 'ü' }
  return ret
})()

const TONE_PRIORITIES = ['a', 'ue', 've', 'e', 'o', ['iu', 'u'], ['ui', 'i'], 'i', 'u', 'v']
const pinyin_separators = /[\s'-]+/
const numeric_tone_pattern = /^([a-z]+)([1-5])$/i

const re_filter = (re: RegExp, text: string) => {
  let result: string[] = []
  text.replace(re, (match) => {
    result.push(match)
    return ''
  })
  return result
}

const swizzleDictionary = {
  '饹': 'ge1',
  '价': 'jia4',
  '只': 'zhi1/zhi3',
  '钥': 'yao4',
  '鹖': 'he2',
  '匙': 'chi2/shi5',
  '壳': 'qiao4/ke2',
  '说': 'shuo1/shui4'
}

const lookup = (i: number): -1 | { character: string, count: number, pinyin: string } | null => {
  const res = hanzi.getCharacterInFrequencyListByPosition(i++)
  if (res == 'Character not found') {
    return -1
  }
  const { character, count, pinyin } = res
  if (!hanzi.definitionLookup(character, 's')) {
    return null
  }
  const swizzle = swizzleDictionary[character]
  if (swizzle === null) {
    return null
  } else if (swizzle) {
    return { character, pinyin: swizzle, count }
  }
  return { character, pinyin, count }
}

const start = (): void => {
  console.time('pinyin_to_chinese')
  let i = 1
  while (true) {
    const res = lookup(i++)
    if (res === -1) break
    if (res === null) continue
    const { character, count, pinyin } = res
    const tone_nums = pinyin.split('/')
    for (const tone_num of tone_nums) {
      const [tone, num] = numeric_tone(tone_num)
      if (!pinyin_to_chinese_dict[tone]) {
        pinyin_to_chinese_dict[tone] = []
      }
      if (!pinyin_to_chinese_dict[tone][num]) {
        pinyin_to_chinese_dict[tone][num] = { character, pinyin: tone_nums.length, count }
      } else {
        if (pinyin_to_chinese_dict[tone][num].pinyin > tone_nums.length) {
          pinyin_to_chinese_dict[tone][num] = { character, pinyin: tone_nums.length, count }
        }
      }
    }
  }
  console.timeEnd('pinyin_to_chinese')
}

const JQXYv = /(?<=^[jqxyJQXY])v/
const JQXYu = /(?<=^[jqxyJQXY])u/
const ReU = /(u:|ü)/

const standardized_tone = (tone: string, num: number): NumericTone => {
  if (tone === 'r' && num === 5) {
    tone = 'er'
  }
  tone = tone.replace(JQXYv, 'u')
  return [tone, num]
}

const numeric_tone = (str: string): NumericTone => {
  const m = numeric_tone_pattern.exec(str.replace(ReU, 'v'))
  if (m) {
    return standardized_tone(m[1], Number(m[2]))
  }
  for (const key of Object.keys(vowels)) {
    if (str.indexOf(key) !== -1) {
      const [tone, num] = vowels[key]
      return standardized_tone(str.replace(key, tone), num)
    }
  }
  return standardized_tone(str, 5)
}

export const numeric_tones = (pinyin_str: string): NumericTone[] => {  
  return pinyin_str.split(pinyin_separators).map(numeric_tone)
}

const same_tone = (a: string, b: string) => {
  b = b.toLowerCase()
  a = a.toLowerCase()
  if (a === b) return true
  if (b === 'er' && a === 'r' || b === 'r' && a === 'er') {
    return true
  }
  if (b === 'ng' || b == 'n') {
    b = 'en'
  }
  return a === b
}

export const tolerant = (text: string, pinyin_str: string) => {
  if (!hanzi.ifComponentExists('一')) {
    hanzi.start()
  }
  if (text === pinyin_str) return true
  const character_array = re_filter(ChineseRegexp, text)
  if (character_array.length === 0) return true
  const pinyin_array = re_filter(PinyinRegexp, pinyin_str).map(numeric_tone)
  console.log(pinyin_array);
  
  if (pinyin_array.length !== character_array.length) {
    console.log(`length doesn't match`, pinyin_array, character_array)
    return false
  }
  let i = 0
  const try_consume = (c: string) => {
    if (pinyin_array.length == i) {
      return true
    }
    const [t, n] = numeric_tone(c)
    const [tone, num] = pinyin_array[i]
    if (same_tone(t, tone)) {
      i++
      return true
    }
  }

  let breaks_on: any = null
  for (const seg of pinyin_iterator(text)) {
    if (seg.pinyin) {
      if (Array.isArray(seg.pinyin)) {
        let matched_any = false
        for (const item of seg.pinyin) {
          const array = re_filter(PinyinRegexp, item)
          let j = 0
          console.log(`try_consume("${array}")`)
          for (const c of array) {
            
            if (try_consume(c)) {
              matched_any = true
            }
            j++
          }
          if (matched_any) {
            breaks_on = array[j - 1]
            break
          }
        }
      } else {
        console.log(`try_consume("${seg.pinyin}")`)
        try_consume(seg.pinyin)
      }
    }
  }
  const matches = i == pinyin_array.length
  if (!matches) {
    console.log(breaks_on, `doesn't match`, pinyin_array[i])
  }
  return matches
}

const pinyin_equal = (nts1: NumericTone[], nts2: NumericTone[]) => {
  return nts1.every(([, num], i) => nts2[i][1] === num)
}

export const random_tones = (tone_nums: NumericTone[], expected_length: number, sample_fn: <N>(list: N[]) => N): NumericTone[][] => {
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
    const random = possibilities.map(([tone, nums]): NumericTone => [tone, sample_fn(nums)])
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
    if (tone.toLowerCase().indexOf(sound) >= 0) {
      const replacing = Array.isArray(group) ? group[1] : group
      return tone.replace(new RegExp(replacing, 'i'), reverted_tone[num][replacing])
    }
  }
  return tone
}

export const tone2num = (text: string) => {
  return numeric_tones(text).map(([tone, num]) => {
    return tone + num
  }).join(' ')
}

const patch_hanzi_num = (hanzi_pinyin: string) => {
  return hanzi_pinyin.replace('u:', 'v')
}

function hanziPinyin(text: string): string[]|string {
  return swizzleDictionary[text]?.split('/') || hanzi.getPinyin(text)
}

function groupByChinese(text: string) {
  const character_array: {chinese: boolean, group: string }[] = []
  let previous = 0
  text.replace(NoneChineseRegexp, (_, group, start) => {
    if (start !== previous) {
      character_array.push({
        chinese: true,
        group: text.substring(previous, start)
      })
    }
    previous = start + group.length
    character_array.push({
      chinese: false,
      group
    })
    return ''
  })
  if (previous !== text.length) {
    character_array.push({
      chinese: true,
      group: text.substring(previous)
    })
  }
  return character_array
}

function* pinyin_iterator(text: string) {
  if (!text) {
    yield null
    return
  }

  const character_array = groupByChinese(text)
  // console.log(character_array)
  for (const { group, chinese } of character_array) {
    if (!chinese) {
      yield { nonChinese: group }
    } else {
      for (const seg of hanzi.segment(group)) {
        const pinyin = hanziPinyin(seg)
        // console.log(`hanziPinyin(${seg}) = ${pinyin}`);
        if (Array.isArray(pinyin)) {
          yield { pinyin: pinyin.map(patch_hanzi_num) }
        } else if (pinyin) {
          yield { pinyin: patch_hanzi_num(pinyin) }
        } else {
          yield { nonParsable: seg as string }
        }
      }
    }
  }
}

function typedPinyin(text: string, type: 'tone' | 'num') {
  if (type == 'tone') {
    return numeric_tones(text).map(nt => revert_numeric_tone(nt)).join(' ')
  } else {
    return tone2num(text)
  }
}

export function pinyin(text: string, type: 'tone' | 'num') {
  if (!hanzi.ifComponentExists('一')) {
    hanzi.start()
  }
  const result: string[] = []
  for (const seg of pinyin_iterator(text)) {
    if (seg.pinyin) {
      if (Array.isArray(seg.pinyin)) {
        result.push(typedPinyin(seg.pinyin[0], type))
      } else {
        result.push(typedPinyin(seg.pinyin, type))
      }
    } else if (seg.nonParsable) {
      result.push(seg.nonParsable)
    } else if (seg.nonChinese) {
      result.push(typedPinyin(seg.nonChinese, type))
    }
  }
  return result.join(' ').toLowerCase()
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
  }).filter(Boolean).join(separator)
}

export function chinese(pinyin_str: string) {
  if (!hanzi.ifComponentExists('一')) {
    hanzi.start()
  }
  if (Object.keys(pinyin_to_chinese_dict).length === 0) {
    start()
  }
  return numeric_tones(pinyin_str).map(([tone, num]) => {
    if (pinyin_to_chinese_dict[tone]) {
      let candidate = pinyin_to_chinese_dict[tone][num]
      if (candidate) {
        if (candidate.pinyin === 1) {
          return candidate.character
        }
        if (num === 5) {
          let max_candidate: ChineseCharacter
          let max_count: number = -1
          for (const i of [1, 2, 3, 4, 5]) {
            const candidate = pinyin_to_chinese_dict[tone][i]
            if (candidate) {
              if (candidate.count > max_count) {
                max_count = candidate.count
                max_candidate = candidate
              }
            }
          }
          if (max_candidate) {
            return max_candidate.character
          }
        } else {
          return candidate.character
        }
      }
      for (const i of [1, 2, 3, 4, 5]) {
        candidate = pinyin_to_chinese_dict[tone][i]
        if (candidate) return candidate.character
      }
    }
    return pinyin_str
  }).join('')
}