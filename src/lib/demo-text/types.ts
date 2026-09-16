/**
 * 互動示範的文字。
 *
 * 示範的邏輯只有一份，文字每語言一份。帶插值的敘述在這裡是「函式」而不是字串，
 * 因為譯者需要決定變數在句子裡的位置——不同語言的語序不一樣。
 */
export interface GraphDemoText {
  /** 列舉多個節點時的分隔符。中文用「、」，英文用「, 」 */
  listSeparator: string;
  bfs: {
    activeLegend: string;
    activeTitle: string;
    start: (node: string) => string;
    popFound: (u: string, found: string, dist: number) => string;
    popNone: (u: string) => string;
    done: (start: string) => string;
  };
  dfs: {
    activeLegend: string;
    activeTitle: string;
    start: (node: string) => string;
    descend: (from: string, u: string) => string;
    visit: (u: string) => string;
    returnTo: (u: string, back: string) => string;
    returnDone: (u: string) => string;
    done: string;
  };
}

export interface DemoText {
  graph: GraphDemoText;
}
