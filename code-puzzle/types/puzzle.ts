export interface PuzzleBlock {
    // ID also acts as the correct position in the list
    id: number;
    code: string;
    explanation: string;
    indentation: number;
    currentIndentation: number;
  }
  
export interface PuzzleState {
    puzzleBlocks: PuzzleBlock[];
}

export type UserAnswerAreaProps = {
  id: string;
  userBlocks: PuzzleBlock[];
  maxIndentationLevel: number;
  highlightedIndent: number | null;
  hintedBlockId: string | null;
  incorrectBlocks: PuzzleBlock[];
};


export type PuzzlePieceProps = {
  block: PuzzleBlock;
  hinted?: boolean;
  currentIndex?: number | null;
  incorrect?: boolean;
};

