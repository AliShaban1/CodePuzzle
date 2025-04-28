export interface PuzzleBlock {
    id: number;
    code: string;
    explanation: string;
    indentation: number;
  }
  
export interface PuzzleState {
    correctBlocks: PuzzleBlock[];
    userBlocks: PuzzleBlock[];
    correctBitMap: boolean[];
}
  