export function searchTextsByContains(textsJson, containsText) {
    const results = [];
    textsJson.forEach(e => {
        if (e.text.includes(containsText)) {
            results.push(e);
        }
    });
    return results;
}

export function applySpecificColorToRawJson(rawJson, fileTexts, targetText, color, strokeColor) {
    fileTexts.forEach(text => {
        if (text.text.includes(targetText)) {
            const targetTextStartIndexArr = findAllIndices(text.text, targetText)
            if (targetTextStartIndexArr != null) {
                targetTextStartIndexArr.forEach(e => {

                    const parsedContent = JSON.parse(formatString(text.json.content));
                    const stylesArrJson = parsedContent.styles
                    performStylesColorApply(stylesArrJson, text.text.length, e, e + targetText.length, color, strokeColor)
                    text.json.content = JSON.stringify(parsedContent);

                })
            }
        }
    })
    rawJson.materials.texts = fileTexts.map(fileText => fileText.json)
    return rawJson
}

function performStylesColorApply(stylesArrJson, length, start, end, color, strokeColor) {
    if (stylesArrJson.length === 1) {
        const stylesItemJson = stylesArrJson[0]
        if (start === 0 && end === length) {
            stylesItemJson.fill = copyFillWithColor(stylesItemJson.fill, color)
            stylesItemJson.strokes = copyStrokesWithColor(stylesItemJson.strokes, strokeColor)
        } else if (start === 0) {
            let newStyles = {
                ...stylesItemJson
            }
            newStyles.fill = copyFillWithColor(stylesItemJson.fill, color)
            newStyles.strokes = copyStrokesWithColor(stylesItemJson.strokes, strokeColor)
            newStyles.range = [0, end]

            stylesItemJson.range = [end, length]
            stylesArrJson.splice(0, 0, newStyles)
        } else if (end === length) {
            let newStyles = {
                ...stylesItemJson
            }
            newStyles.fill = copyFillWithColor(stylesItemJson.fill, color)
            newStyles.strokes = copyStrokesWithColor(stylesItemJson.strokes, strokeColor)
            newStyles.range = [start, length]

            stylesItemJson.range = [0, start]
            stylesArrJson.splice(1, 0, newStyles)
        } else {
            let preNewStyles = {
                ...stylesItemJson,
                range: [0, start]
            }
            let sufNewStyles = {
                ...stylesItemJson,
                range: [end, length]
            }
            let centerNewStyles = {
                ...stylesItemJson,
                range: [start, end]
            }

            centerNewStyles.fill = copyFillWithColor(stylesItemJson.fill, color)
            centerNewStyles.strokes = copyStrokesWithColor(stylesItemJson.strokes, strokeColor)

            stylesArrJson.splice(0, stylesArrJson.length);
            stylesArrJson.push(preNewStyles)
            stylesArrJson.push(centerNewStyles)
            stylesArrJson.push(sufNewStyles)
        }
    } else {
        // [0,3][3,6] | [0,2] -> [0,2][2,3][3,6]
        const indexMap = findStartCoverStylesIndex(stylesArrJson, start, end)
        let startEdgeIndex = indexMap.startEdgeIndex;
        let fullCoverIndexArr = indexMap.fullCoverIndexArr;
        let endEdgeIndex = indexMap.endEdgeIndex;


        if (fullCoverIndexArr) {
            stylesArrJson.forEach((styleItem, index) => {
                if (fullCoverIndexArr.includes(index)) {
                    // const newItem = {
                    //     ...styleItem
                    // }
                    styleItem.fill = copyFillWithColor(styleItem.fill, color)
                    styleItem.strokes = copyStrokesWithColor(styleItem.strokes, strokeColor)
                }
            })
        }

        // 对于start和end的部分覆盖index，需要多生成一段styles，即开始处可能多增一段，结尾处可能多增一段，最多对原styles片段集合中增加两段
        if (endEdgeIndex !== undefined) {
            let endEdgeNewItem = createEdgeNewStyles(stylesArrJson, endEdgeIndex, end, false, color, strokeColor)
            stylesArrJson.splice(endEdgeIndex, 0, endEdgeNewItem)
        }
        if (startEdgeIndex !== undefined) {
            let startEdgeNewItem = createEdgeNewStyles(stylesArrJson, startEdgeIndex, start, true, color, strokeColor)
            stylesArrJson.splice(startEdgeIndex + 1, 0, startEdgeNewItem)
        }
    }
}

function copyFillWithColor(fillJson, color) {
    let newFillJson;
    if (!fillJson) {
        newFillJson = {
            content: {
                solid: {
                    color: hexToRgbArray(color)
                }
            }
        };
    } else {
        newFillJson = JSON.parse(JSON.stringify(fillJson));
        // if (!newFillJson.content.solid) {
        //     newFillJson.content.solid = {}
        // }
        newFillJson.content.solid.color = hexToRgbArray(color);
    }
    return newFillJson;
}

function copyStrokesWithColor(strokeArrJson, strokeColor) {
    let newStrokeArrJson;
    if (!strokeArrJson) {
        newStrokeArrJson = [{
            width: 0.08,
            content: {
                solid: {
                    color: hexToRgbArray(strokeColor)
                }
            }
        }];
    } else {
        let strokeJson = strokeArrJson[0];
        let newStrokeJson = JSON.parse(JSON.stringify(strokeJson));
        newStrokeJson.content.solid.color = hexToRgbArray(strokeColor);
        newStrokeArrJson = [newStrokeJson];
    }
    return newStrokeArrJson;
}

// 找到要改变的字符串开始索引所影响的styleItem片段index
function findStartCoverStylesIndex(stylesArr, start, end) {
    let startEdgeIndex;
    let fullCoverIndexArr = [];
    let endEdgeIndex;
    stylesArr.forEach((styleItem, index) => {
        // 片段开始index
        const phaseStart = styleItem.range[0]
        // 片段结束index
        const phaseEnd = styleItem.range[1]
        console.log("findStartCoverStylesIndex for, phaseStart = " + phaseStart + ", phaseEnd = " + phaseEnd)
        console.log("findStartCoverStylesIndex for, start = " + start + ", end = " + end)

        // 如果start所以在之内，则认为这是startCoverIndex
        if (start > phaseStart && start < phaseEnd) {
            startEdgeIndex = index;
        }
        // 如果end所以在之内，则认为这是endCoverIndex
        if (end > phaseStart && end < phaseEnd) {
            endEdgeIndex = index;
        }
        // 如果range整个在start和end之间，则认为是fullCoverIndex（可能存在多个）
        if (start <= phaseStart && end >= phaseEnd) {
            fullCoverIndexArr.push(index)
        }
    })
    return {
        startEdgeIndex: startEdgeIndex,
        fullCoverIndexArr: fullCoverIndexArr,
        endEdgeIndex: endEdgeIndex,
    }
}

function createEdgeNewStyles(stylesArrJson, styleIndex, splitRangeIndex, isStart, color, strokeColor) {
    const effectStyleItem = stylesArrJson[styleIndex]
    const effectStyleItemStartRange = effectStyleItem.range[0]
    const effectStyleItemEndRange = effectStyleItem.range[1]

    const newStyleItem = JSON.parse(JSON.stringify(effectStyleItem))

    if (isStart) {
        effectStyleItem.range[0] = effectStyleItemStartRange
        effectStyleItem.range[1] = splitRangeIndex

        newStyleItem.range[0] = splitRangeIndex
        newStyleItem.range[1] = effectStyleItemEndRange
        newStyleItem.fill = copyFillWithColor(newStyleItem.fill, color)
        newStyleItem.strokes = copyStrokesWithColor(newStyleItem.strokes, strokeColor)
    } else {
        effectStyleItem.range[0] = splitRangeIndex
        effectStyleItem.range[1] = effectStyleItemEndRange

        newStyleItem.range[0] = effectStyleItemStartRange
        newStyleItem.range[1] = splitRangeIndex
        newStyleItem.fill = copyFillWithColor(newStyleItem.fill, color)
        newStyleItem.strokes = copyStrokesWithColor(newStyleItem.strokes, strokeColor)
    }

    return newStyleItem
}

function findAllIndices(haystack, needle) {
    let startIndex = 0;  // 开始搜索的位置
    let index;           // 当前找到的索引位置
    let indices = [];    // 存储所有找到的索引

    // 循环，直到indexOf返回-1，表示没有更多的匹配
    while ((index = haystack.indexOf(needle, startIndex)) > -1) {
        indices.push(index);   // 将当前找到的索引添加到数组中
        startIndex = index + 1; // 移动开始位置到当前找到的索引之后
    }

    return indices;
}

function rgbArrayToHex(rgbArray) {
    return '#' + rgbArray
        .map(num => Math.round(num * 255)   // 转换范围从 0-1 到 0-255
            .toString(16)      // 转换为十六进制
            .padStart(2, '0')) // 确保两位数，不足补0
        .join('');         // 连接成字符串
}

function hexToRgbArray(hex) {
    // 去除前导的 '#' 如果有的话
    if (hex.startsWith('#')) {
        hex = hex.slice(1);
    }

    // 如果是三位十六进制则转换为六位
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // 提取红绿蓝三种颜色的十六进制数值并转换为0-1范围的数
    return [
        parseInt(hex.substring(0, 2), 16) / 255,
        parseInt(hex.substring(2, 4), 16) / 255,
        parseInt(hex.substring(4, 6), 16) / 255
    ];
}

export function assembleTextArrModel(json) {
    const texts = json["materials"]["texts"];

    const textModelArr = []
    texts.forEach((text, index) => {
        let contentStr = text["content"]
        const contentJson = JSON.parse(formatString(contentStr))

        const textStr = contentJson["text"]
        const stylesJson = contentJson["styles"]

        const lineSubTexts = []
        if (stylesJson !== undefined) {
            if (stylesJson.length === 1) {
                lineSubTexts.push(assembleSubTexts(textStr, stylesJson[0]))
            } else {
                stylesJson.forEach(e => {
                    lineSubTexts.push(assembleSubTexts(textStr, e))
                })
            }
        }
        textModelArr.push({"subTexts": lineSubTexts, "text": textStr, "index": index, "json": text})
    })

    return textModelArr
}

export function assembleSubTexts(textStr, stylesJson) {
    const colorArr = stylesJson?.fill?.content?.solid?.color
    let colorStr;
    if (colorArr !== undefined) {
        colorStr = rgbArrayToHex(colorArr)
    }

    const strokesArr = stylesJson?.strokes
    let strokeColorStr;
    let strokeWidth = '0';
    if (strokesArr !== undefined && strokesArr.length > 0) {
        const strokesJson = strokesArr[0]
        const colorArr = strokesJson?.content?.solid?.color
        strokeColorStr = rgbArrayToHex(colorArr)
        strokeWidth = '1px';
    }

    const rangeArr = stylesJson?.range
    let subText;
    if (rangeArr !== undefined) {
        const startIdx = rangeArr[0]
        const endIdx = rangeArr[1]

        subText = textStr.substr(startIdx, endIdx - startIdx)
    }

    const subTextModel = {};
    if (subText !== undefined) {
        subTextModel["text"] = subText
    } else {
        subTextModel["text"] = textStr
    }
    if (colorStr !== undefined) {
        subTextModel["color"] = colorStr
    }
    subTextModel["strokeWidth"] = strokeWidth
    if (strokeColorStr !== undefined) {
        subTextModel["strokeColor"] = strokeColorStr
    }
    return subTextModel
}

function formatString(toFormatString) {
    return toFormatString.replace(/\s/g, '')
}
