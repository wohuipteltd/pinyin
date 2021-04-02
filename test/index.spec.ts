import * as hanzi from 'hanzi'

before(() => {
  if (!hanzi.ifComponentExists('一')) {
    hanzi.start()
  }
})