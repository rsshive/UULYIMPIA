# Kế hoạch triển khai: Âm thanh chỉ phát ở Màn chiếu & Hiệu ứng Waterfall Bảng điểm

## 1. Mục tiêu
- **Chuyển toàn bộ âm thanh sang màn hình chiếu (Presentation)**:
  - Màn hình Host hoàn toàn không phát bất kỳ âm thanh nào (không phát nhạc nền timer, không kêu tick, không phát âm đúng/sai hay chiến thắng).
  - Chỉ duy nhất màn hình chiếu (`?view=presentation`, gồm cả cửa sổ popout và chế độ chiếu tại chỗ) phát đầy đủ tất cả âm thanh của chương trình.
- **Thêm hiệu ứng Waterfall khi hiện Bảng điểm (`PresentationScoreboard`)**:
  - Tiêu đề "BẢNG XẾP HẠNG" trượt thác nước (`animate-waterfall`) từ trên xuống.
  - Từng thẻ xếp hạng của các đội tuyển trượt thác nước mềm mại, xuất hiện lần lượt so le nhau (`staggered delay`: 100ms, 200ms, 300ms, 400ms...) tạo cảm giác công bố kết quả kịch tính và chuyên nghiệp của gameshow Đường lên đỉnh Olympia.

## 2. Các bước triển khai chi tiết

### Bước 1: Kiểm soát âm thanh theo vai trò màn hình (`audio.ts` & `GameContext.tsx`)
- Trong `src/utils/audio.ts`:
  - Thêm hàm kiểm tra ngữ cảnh thực thi: nếu không phải `isPresentationView` (tức là đang ở màn hình Host chính), chặn tất cả âm thanh:
    - `playCorrect()`, `playWrong()`, `playTick()`, `playWarning()`, `playVictory()`
    - `startTimerSoundtrack()`, `resumeTimerSoundtrack()`
  - Trong `GameContext.tsx`:
    - Ở màn hình Host: không gọi hàm phát âm thanh.
    - Ở màn hình chiếu: lắng nghe sự kiện thay đổi trạng thái (hoặc nhận broadcast) để tự động phát âm thanh đồng bộ chính xác.

### Bước 2: Hiệu ứng Waterfall cho Bảng điểm (`PresentationScoreboard.tsx`)
- Cập nhật `src/components/presentation/PresentationScoreboard.tsx`:
  - Thêm class `animate-waterfall` cho Header bảng điểm.
  - Với danh sách thẻ đội `sortedTeams.map((team, idx) => ...)`:
    - Thêm class `animate-waterfall` vào từng card.
    - Áp dụng `style={{ animationDelay: `${150 + idx * 100}ms` }}` để các thẻ lần lượt trượt xuống từ trên theo hiệu ứng thác nước mượt mà.

## 3. Kiểm tra và xác minh
- Kiểm tra bằng `lint_applet` và `compile_applet`.
- Xác nhận màn hình Host im lặng hoàn toàn, trong khi màn chiếu phát âm thanh và bảng điểm hiện hiệu ứng waterfall.
