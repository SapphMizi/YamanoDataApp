// JSONパース用のユーティリティ関数

// 有効なJSONかどうかをチェックする関数
function isValidJson(str: string): boolean {
  try {
    JSON.parse(str)
    return true
  } catch {
    return false
  }
}

// 二重エスケープされたJSONを適切に処理する関数
export function parseJsonSafely(jsonString: any): any {
  if (typeof jsonString !== 'string') {
    return jsonString
  }
  
  // 文字列が有効なJSONかどうかをチェック
  if (!isValidJson(jsonString)) {
    // 有効なJSONでない場合、単純な文字列として返す
    console.log('Not valid JSON, returning as string:', jsonString)
    return jsonString
  }
  
  try {
    // まず通常のJSONパースを試行
    const parsed = JSON.parse(jsonString)
    
    // パース結果が文字列の場合、再度パースを試行（二重エスケープの場合）
    if (typeof parsed === 'string') {
      if (isValidJson(parsed)) {
        try {
          return JSON.parse(parsed)
        } catch {
          return parsed
        }
      } else {
        return parsed
      }
    }
    
    return parsed
  } catch (error) {
    console.warn('Failed to parse JSON:', error, 'Original string:', jsonString)
    return jsonString
  }
}

// 配列の各要素を安全にパースする関数
export function parseArraySafely(array: any[]): any[] {
  console.log('parseArraySafely input:', array, 'Type:', typeof array, 'IsArray:', Array.isArray(array))
  
  if (!Array.isArray(array)) {
    console.log('Not an array, returning empty array')
    return []
  }
  
  const result = array.map((item, index) => {
    console.log(`Processing array item ${index}:`, item, 'Type:', typeof item)
    if (typeof item === 'string') {
      const parsed = parseJsonSafely(item)
      console.log(`Parsed item ${index}:`, parsed)
      return parsed
    }
    console.log(`Item ${index} is not string, returning as-is:`, item)
    return item
  })
  
  console.log('parseArraySafely result:', result)
  return result
}
