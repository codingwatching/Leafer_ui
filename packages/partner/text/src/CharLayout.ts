import { ITextCharData, ITextData, ITextDrawData, ITextRowData } from '@leafer-ui/interface'


const CharMode = 0 // data: [{char:'a', x: 0}, {char:'b', x: 5}, {char:'d', x:20}]
const WordMode = 1 // data: [{ char:'ab', x: 0}, { char:'d', x:20}]
const TextMode = 2 // text: 'ab  c'

export function layoutChar(drawData: ITextDrawData, style: ITextData, width: number, _height: number): void {

    const { rows } = drawData
    const { textAlign, paraIndent, letterSpacing } = style
    let charX: number, addWordWidth: number, indentWidth: number, mode: number, wordChar: ITextCharData, wordsLength: number

    rows.forEach(row => {
        if (row.words) {

            indentWidth = paraIndent && row.paraStart ? paraIndent : 0, wordsLength = row.words.length
            addWordWidth = (width && (textAlign === 'justify' || textAlign === 'both') && wordsLength > 1) ? (width - row.width - indentWidth) / (wordsLength - 1) : 0
            mode = (letterSpacing || row.isOverflow) ? CharMode : (addWordWidth > 0.01 ? WordMode : TextMode)
            if (row.isOverflow && !letterSpacing) row.textMode = true

            if (mode === TextMode) {

                row.x += indentWidth
                toTextChar(row)

            } else {

                row.x += indentWidth
                charX = row.x
                row.data = []

                row.words.forEach((word, index) => {

                    if (mode === WordMode) {

                        wordChar = { char: '', x: charX }
                        charX = toWordChar(word.data, charX, wordChar)
                        if (row.isOverflow || wordChar.char !== ' ') row.data.push(wordChar)

                    } else {

                        charX = toChar(word.data, charX, row.data, row.isOverflow)

                    }

                    if (addWordWidth && (!row.paraEnd || textAlign === 'both') && (index !== wordsLength - 1)) {
                        charX += addWordWidth
                        row.width += addWordWidth
                    }

                })
            }

            row.words = null
        }
    })

}

function toTextChar(row: ITextRowData): void {
    row.text = ''
    row.words.forEach(word => {
        word.data.forEach(char => {
            row.text += char.char
        })
    })
}

function toWordChar(data: ITextCharData[], charX: number, wordChar: ITextCharData): number {
    data.forEach(char => {
        wordChar.char += char.char
        charX += char.width
    })
    return charX
}

function toChar(data: ITextCharData[], charX: number, rowData: ITextCharData[], isOverflow?: boolean): number {
    data.forEach(char => {
        if (isOverflow || char.char !== ' ') {
            char.x = charX
            rowData.push(char)
        }
        charX += char.width
    })
    return charX
}