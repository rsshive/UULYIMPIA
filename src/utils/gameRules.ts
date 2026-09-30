import type { GameState } from '../types/game';

/**
 * Tính số điểm Chướng ngại vật theo quy định Đường Lên Đỉnh Olympia:
 * - Trả lời đúng trong 1 từ hàng ngang đầu tiên: 60 điểm
 * - Trong 2 từ hàng ngang: 50 điểm
 * - Trong 3 từ hàng ngang: 40 điểm
 * - Trong 4 từ hàng ngang: 30 điểm
 */
export function calculateObstaclePoints(round2: GameState['round2']): number {
  const played = round2.playedClueIds || [];
  let count = played.length;
  // Nếu có clue đang active nhưng chưa được đưa vào mảng played, coi như đang ở clue đó
  if (round2.activeClueId !== null && !played.includes(round2.activeClueId)) {
    count += 1;
  }
  // Mặc định hoặc trong hàng ngang đầu tiên
  if (count <= 1) return 60;
  if (count === 2) return 50;
  if (count === 3) return 40;
  return 30; // 4 hàng ngang
}
