import { ILeaferCanvas } from '@leafer/interface'
import { ImageManager, Platform, ResizeEvent } from '@leafer/core'

import { IUI, ILeafPaint, ILeafPaintPatternData } from '@leafer-ui/interface'
import { Export } from '@leafer-ui/draw'

import { createPattern } from './pattern'


export function checkImage(ui: IUI, canvas: ILeaferCanvas, paint: ILeafPaint, allowDraw?: boolean): boolean {
    const { scaleX, scaleY } = ui.getRenderScaleData(true, paint.scaleFixed)
    const { pixelRatio } = canvas, { data } = paint

    if (!data || (paint.patternId === scaleX + '-' + scaleY + '-' + pixelRatio && !Export.running)) {
        return false // 生成图案中
    } else {

        if (allowDraw) {
            if (data.repeat) {
                allowDraw = false
            } else {
                if (!(paint.changeful || (Platform.name === 'miniapp' && ResizeEvent.isResizing(ui)) || Export.running)) { //  小程序resize过程中直接绘制原图（绕过垃圾回收bug)
                    let { width, height } = data
                    width *= scaleX * pixelRatio
                    height *= scaleY * pixelRatio
                    if (data.scaleX) {
                        width *= data.scaleX
                        height *= data.scaleY
                    }
                    allowDraw = (width * height > Platform.image.maxCacheSize)
                }
            }
        }

        if (allowDraw) {
            if (ui.__.__isFastShadow) { // fix: 快速阴影时，直接 drawImage 会无阴影，需fill一下
                canvas.fillStyle = paint.style || '#000'
                canvas.fill()
            }
            drawImage(ui, canvas, paint, data) // 直接绘制图像，不生成图案
            return true
        } else {
            if (!paint.style || paint.sync || Export.running) {
                createPattern(ui, paint, pixelRatio)
            } else {
                if (!paint.patternTask) {
                    paint.patternTask = ImageManager.patternTasker.add(async () => {
                        paint.patternTask = null
                        if (canvas.bounds.hit(ui.__nowWorld)) createPattern(ui, paint, pixelRatio)
                        ui.forceUpdate('surface')
                    }, 300)
                }
            }
            return false
        }
    }
}


function drawImage(ui: IUI, canvas: ILeaferCanvas, paint: ILeafPaint, data: ILeafPaintPatternData): void { // 后续可优化
    canvas.save()
    canvas.clipUI(ui)
    if (paint.blendMode) canvas.blendMode = paint.blendMode
    if (data.opacity) canvas.opacity *= data.opacity
    if (data.transform) canvas.transform(data.transform)
    canvas.drawImage(paint.image.getFull(data.filters), 0, 0, data.width, data.height)
    canvas.restore()
}