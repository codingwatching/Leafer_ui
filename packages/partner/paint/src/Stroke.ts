import { ILeaferCanvas } from '@leafer/interface'
import { LeafHelper, isObject } from "@leafer/core"

import { IUI, ILeafPaint } from '@leafer-ui/interface'
import { Paint } from '@leafer-ui/draw'

import { strokeText, drawStrokesStyle } from './StrokeText'


export function stroke(stroke: string, ui: IUI, canvas: ILeaferCanvas): void {
    const data = ui.__
    if (!data.__strokeWidth) return

    if (data.__font) {

        strokeText(stroke, ui, canvas)

    } else {

        switch (data.strokeAlign) {
            case 'center':
                drawCenter(stroke, 1, ui, canvas)
                break
            case 'inside':
                drawInside(stroke, ui, canvas)
                break
            case 'outside':
                drawOutside(stroke, ui, canvas)
                break
        }

    }
}


export function strokes(strokes: ILeafPaint[], ui: IUI, canvas: ILeaferCanvas): void {
    stroke(strokes as any, ui, canvas)
}


function drawCenter(stroke: string | ILeafPaint[], strokeWidthScale: number, ui: IUI, canvas: ILeaferCanvas) {
    const data = ui.__
    if (isObject(stroke)) {
        drawStrokesStyle(stroke, strokeWidthScale, false, ui, canvas)
    } else {
        canvas.setStroke(stroke, data.__strokeWidth * strokeWidthScale, data)
        canvas.stroke()
    }

    if (data.__useArrow) Paint.strokeArrow(stroke, ui, canvas)
}

function drawInside(stroke: string | ILeafPaint[], ui: IUI, canvas: ILeaferCanvas) {
    canvas.save()
    canvas.clipUI(ui)

    drawCenter(stroke, 2, ui, canvas)
    canvas.restore()
}

function drawOutside(stroke: string | ILeafPaint[], ui: IUI, canvas: ILeaferCanvas) {
    const data = ui.__
    if (data.__fillAfterStroke) {

        drawCenter(stroke, 2, ui, canvas)

    } else {
        const { renderBounds } = ui.__layout
        const out = canvas.getSameCanvas(true, true)
        ui.__drawRenderPath(out)

        drawCenter(stroke, 2, ui, out)

        out.clipUI(data)
        out.clearWorld(renderBounds)

        LeafHelper.copyCanvasByWorld(ui, canvas, out)

        out.recycle(ui.__nowWorld)
    }
}
