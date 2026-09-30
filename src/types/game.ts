export type Team = {
  id: string;
  name: string;
  score: number;
  canGuessObstacle: boolean;
  color: string; // e.g. '#3B82F6', '#EAB308', '#EF4444', '#10B981'
};

export type Round1Question = {
  id: number;
  question: string;
  options?: string[];
  answer: string;
  correctOptionIndex?: number;
  timeLimit: number; // in seconds, e.g. 10 or 15
};

export type ObstacleClue = {
  id: number;
  rowLabel: string; // e.g. "Hàng ngang 1"
  question: string;
  answer: string;
  isRevealed: boolean;
  timeLimit: number;
};

export type ObstacleData = {
  keyword: string; // Tên chướng ngại vật (bí mật)
  description: string;
  imageUrl: string; // Hình ảnh lớn ở trung tâm
  clues: ObstacleClue[];
  isFullyRevealed: boolean;
};

export type GamePhase =
  | 'IDLE'                 // Sẵn sàng trước khi mở câu hỏi
  | 'QUESTION_ACTIVE'     // Đang đọc câu hỏi & đếm giờ
  | 'TEAM_ANSWERING'      // Host đã chọn đội giơ tay, đội đang phát biểu
  | 'RESULT_REVEAL'       // Vừa bấm Đúng/Sai, đang hiển thị kết quả
  | 'SHOWING_SCOREBOARD'  // Đang phóng to bảng xếp hạng trên Presentation
  | 'OBSTACLE_GUESSING';  // Đang trong trạng thái có đội xin đoán chướng ngại vật

export type GameState = {
  round: 1 | 2;
  phase: GamePhase;
  isStandby: boolean; // Trạng thái màn hình chờ (true: hiện màn hình tên vòng thi, false: vào giao diện thi đấu)
  teams: Team[];
  activeTeamId: string | null;
  timerSeconds: number;
  isTimerRunning: boolean;
  isTimerIntroDelaying?: boolean; // 1 giây intro trễ trước khi timer xuất hiện và bắt đầu đếm ngược
  scoreModifier: number; // Điểm sẽ cộng nếu chọn ĐÚNG (mặc định 10)
  
  // Vòng 1
  round1: {
    currentQuestionIndex: number; // 0..9
    questions: Round1Question[];
    selectedOptionIndex: number | null;
    lastResult: 'CORRECT' | 'WRONG' | 'TIMEOUT' | 'SKIPPED' | null;
    lastPointsAwarded: number;
  };

  // Vòng 2
  round2: {
    obstacle: ObstacleData;
    activeClueId: number | null; // 1..4
    playedClueIds?: number[]; // Danh sách ID các hàng ngang đã/đang được mở hoặc chọn
    obstacleSolvedBy: string | null; // team id nếu đã giải được
    lastResult: 'CORRECT' | 'WRONG' | 'TIMEOUT' | 'SKIPPED' | null;
    lastPointsAwarded: number;
  };
};

export type GameAction =
  | { type: 'SET_ROUND'; round: 1 | 2 }
  | { type: 'SET_STANDBY'; isStandby: boolean }
  | { type: 'START_QUESTION' }
  | { type: 'BEGIN_COUNTDOWN' }
  | { type: 'PAUSE_TIMER' }
  | { type: 'RESUME_TIMER' }
  | { type: 'RESET_TIMER'; seconds: number }
  | { type: 'TICK_TIMER' }
  | { type: 'CHOOSE_OPTION'; optionIndex: number }
  | { type: 'SELECT_TEAM_FOR_ANSWER'; teamId: string }
  | { type: 'SUBMIT_ANSWER'; isCorrect: boolean; pointsOverride?: number }
  | { type: 'SKIP_QUESTION' }
  | { type: 'NEXT_QUESTION' }
  | { type: 'PREV_QUESTION' }
  | { type: 'TOGGLE_SCOREBOARD' }
  | { type: 'UPDATE_TEAM_SCORE'; teamId: string; delta: number }
  | { type: 'SET_SCORE_MODIFIER'; points: number }
  | { type: 'UPDATE_TEAM_NAME'; teamId: string; name: string }
  | { type: 'ADD_TEAM'; name: string }
  | { type: 'REMOVE_TEAM'; teamId: string }
  // Round 2 specific
  | { type: 'SELECT_CLUE'; clueId: number }
  | { type: 'REVEAL_CLUE_PIECE'; clueId: number }
  | { type: 'START_OBSTACLE_GUESS'; teamId: string; pointsOverride?: number }
  | { type: 'SUBMIT_OBSTACLE_GUESS'; isCorrect: boolean; pointsOverride?: number }
  | { type: 'REVEAL_FULL_OBSTACLE' }
  | { type: 'RESET_GAME' }
  | { type: 'SYNC_STATE'; state: GameState };
