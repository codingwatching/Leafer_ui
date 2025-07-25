import { IBoundsData, IPointData, IMatrixData, IAlign, ISizeData } from '@leafer/interface'
import { getMatrixData, MatrixHelper } from '@leafer/core'

import { ILeafPaintPatternData } from '@leafer-ui/interface'


let origin = {} as IPointData, tempMatrix = getMatrixData()
const { get, rotateOfOuter, translate, scaleOfOuter, multiplyParent, scale: scaleHelper, rotate, skew: skewHelper } = MatrixHelper

export function fillOrFitMode(data: ILeafPaintPatternData, box: IBoundsData, x: number, y: number, scaleX: number, scaleY: number, rotation: number): void {
    const transform: IMatrixData = get()
    translate(transform, box.x + x, box.y + y)
    scaleHelper(transform, scaleX, scaleY)
    if (rotation) rotateOfOuter(transform, { x: box.x + box.width / 2, y: box.y + box.height / 2 }, rotation)
    data.transform = transform
}

export function clipMode(data: ILeafPaintPatternData, box: IBoundsData, x: number, y: number, scaleX: number, scaleY: number, rotation: number, skew: IPointData, clipSize?: ISizeData): void {
    const transform: IMatrixData = get()
    layout(transform, box, x, y, scaleX, scaleY, rotation, skew)
    if (clipSize) {
        tempMatrix.a = box.width / clipSize.width, tempMatrix.d = box.height / clipSize.height
        multiplyParent(transform, tempMatrix)
    }
    data.transform = transform
}

export function repeatMode(data: ILeafPaintPatternData, box: IBoundsData, width: number, height: number, x: number, y: number, scaleX: number, scaleY: number, rotation: number, skew: IPointData, align: IAlign, freeTransform?: boolean): void {
    const transform = get()
    if (freeTransform) { // 自由变换
        layout(transform, box, x, y, scaleX, scaleY, rotation, skew)
    } else {
        if (rotation) {
            if (align === 'center') {
                rotateOfOuter(transform, { x: width / 2, y: height / 2 }, rotation)
            } else {
                rotate(transform, rotation)
                switch (rotation) {
                    case 90:
                        translate(transform, height, 0)
                        break
                    case 180:
                        translate(transform, width, height)
                        break
                    case 270:
                        translate(transform, 0, width)
                        break
                }
            }
        }
        origin.x = box.x + x
        origin.y = box.y + y
        translate(transform, origin.x, origin.y)
        if (scaleX) scaleOfOuter(transform, origin, scaleX, scaleY)
    }
    data.transform = transform
}

function layout(transform: IMatrixData, box: IBoundsData, x: number, y: number, scaleX: number, scaleY: number, rotation: number, skew: IPointData) {
    // rotate -> skew -> scale -> translate
    if (rotation) rotate(transform, rotation)
    if (skew) skewHelper(transform, skew.x, skew.y)
    if (scaleX) scaleHelper(transform, scaleX, scaleY)
    translate(transform, box.x + x, box.y + y)
}
