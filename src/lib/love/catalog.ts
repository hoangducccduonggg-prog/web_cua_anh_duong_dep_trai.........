import type { LucideIcon } from "lucide-react";
import {
  AudioLines,
  Award,
  Bell,
  Brain,
  Brush,
  Cake,
  CalendarDays,
  Cat,
  Clapperboard,
  Database,
  Disc,
  Flame,
  Frame,
  Grip,
  Hourglass,
  Images,
  ListChecks,
  LockKeyhole,
  Mail,
  MapPinned,
  MessageCircleHeart,
  MoonStar,
  NotebookPen,
  Orbit,
  Snowflake,
  Sparkles,
  Ticket,
  Timer,
  Trees,
} from "lucide-react";
import type { GroupId, ModuleId } from "./types";

export type ModuleMeta = {
  id: ModuleId;
  index: string;
  group: GroupId;
  groupLabel: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
};

export const GROUPS: { id: GroupId; label: string }[] = [
  { id: "start", label: "Khởi đầu" },
  { id: "dream", label: "Mộng" },
  { id: "daily", label: "Mỗi ngày" },
  { id: "play", label: "Vui chơi" },
  { id: "ever", label: "Mãi mãi" },
];

export const CATALOG: ModuleMeta[] = [
  { id: "lock", index: "01", group: "start", groupLabel: "Khởi đầu", title: "Màn hình khóa", blurb: "Trái tim đập trên nền đêm, khung ảnh xoay nhẹ và phím số phát sáng. Đúng mật khẩu là một chùm pháo hoa.", icon: LockKeyhole },
  { id: "clock", index: "02", group: "start", groupLabel: "Khởi đầu", title: "Đồng hồ nhịp yêu", blurb: "Đếm từng giây từ ngày bắt đầu, kèm tiến trình tới các cột mốc và sinh nhật của hai người.", icon: Timer },
  { id: "today", index: "03", group: "start", groupLabel: "Khởi đầu", title: "Trạm hôm nay", blurb: "Chọn món muốn ăn, đồ muốn mua, chỗ hẹn và tâm trạng. Bấm lưu, máy kia nhận một thông báo nhỏ.", icon: Bell },
  { id: "pings", index: "04", group: "start", groupLabel: "Khởi đầu", title: "Nhắn nhanh", blurb: "Một câu ngắn bay sang màn hình bên kia, giữ 20 tin gần nhất.", icon: MessageCircleHeart },
  { id: "letters", index: "05", group: "start", groupLabel: "Khởi đầu", title: "Tủ thư tình", blurb: "Niêm phong sáp, chữ hiện từng nét, viết thêm thư và cất trong máy.", icon: Mail },
  { id: "album", index: "06", group: "start", groupLabel: "Khởi đầu", title: "Album kỷ niệm", blurb: "Tải ảnh, ghi chú ngày, xóa ảnh mẫu, xem lưới hoặc trình chiếu.", icon: Images },
  { id: "cake", index: "07", group: "dream", groupLabel: "Mộng", title: "Bánh sinh nhật", blurb: "Bánh ba tầng, khung ảnh xoay quanh, thổi micro hoặc bấm nút để tắt nến.", icon: Cake },
  { id: "tree", index: "08", group: "dream", groupLabel: "Mộng", title: "Cây tình yêu", blurb: "Cây mọc theo mỗi lần tưới và bón. Treo thẻ ước lên cành khi hoa đủ dày.", icon: Trees },
  { id: "sky", index: "09", group: "dream", groupLabel: "Mộng", title: "Bầu trời đêm", blurb: "Chạm sao sáng để nối thành chòm và mở lời nhắn giấu.", icon: MoonStar },
  { id: "globe", index: "10", group: "dream", groupLabel: "Mộng", title: "Quả cầu tuyết", blurb: "Lắc hoặc vuốt để bão trái tim xoay quanh ảnh hai bạn.", icon: Snowflake },
  { id: "museum", index: "11", group: "dream", groupLabel: "Mộng", title: "Phòng kỷ vật", blurb: "Mỗi khung một vật nhớ, kèm lời kể có thể nghe bằng giọng máy.", icon: Frame },
  { id: "lanterns", index: "12", group: "dream", groupLabel: "Mộng", title: "Đèn lồng ước", blurb: "Viết điều ước lên đèn giấy và thả vào trời đêm của riêng hai người.", icon: Flame },
  { id: "pet", index: "13", group: "daily", groupLabel: "Mỗi ngày", title: "Thú cưng chung", blurb: "Cho ăn, tắm, chơi và đổi phụ kiện. Chỉ số giảm nếu mình quên quá lâu.", icon: Cat },
  { id: "journal", index: "14", group: "daily", groupLabel: "Mỗi ngày", title: "Nhật ký cảm xúc", blurb: "Ghi một ngày kèm tâm trạng để người kia đọc và hiểu.", icon: NotebookPen },
  { id: "vouchers", index: "15", group: "daily", groupLabel: "Mỗi ngày", title: "Hũ voucher", blurb: "Thẻ quyền lợi tự chế. Khi dùng, máy kia nhận tin ngay.", icon: Ticket },
  { id: "map", index: "16", group: "daily", groupLabel: "Mỗi ngày", title: "Bản đồ hẹn hò", blurb: "Ghim quán, rạp, chuyến đi đã qua và những nơi còn hẹn.", icon: MapPinned },
  { id: "bucket", index: "17", group: "daily", groupLabel: "Mỗi ngày", title: "100 điều cùng làm", blurb: "Sổ việc muốn làm chung. Tích xong là giữ lại ngày đã làm.", icon: ListChecks },
  { id: "calendar", index: "18", group: "daily", groupLabel: "Mỗi ngày", title: "Lịch ngày quan trọng", blurb: "Đếm ngược sinh nhật, kỷ niệm tháng, lễ và sự kiện hai bạn thêm.", icon: CalendarDays },
  { id: "vinyl", index: "19", group: "play", groupLabel: "Vui chơi", title: "Đĩa than", blurb: "Đĩa xoay, sóng nhạc và lời hát. Có thể dán link nhạc của riêng mình.", icon: Disc },
  { id: "movies", index: "20", group: "play", groupLabel: "Vui chơi", title: "Rạp mini", blurb: "Danh sách phim muốn xem, chấm điểm, hoặc rút ngẫu nhiên khi phân vân.", icon: Clapperboard },
  { id: "draw", index: "21", group: "play", groupLabel: "Vui chơi", title: "Bảng vẽ", blurb: "Nét phát sáng trên nền đêm. Lưu thành ảnh để tặng.", icon: Brush },
  { id: "puzzle", index: "22", group: "play", groupLabel: "Vui chơi", title: "Ghép hình kỷ niệm", blurb: "Lật thẻ bằng chính ảnh album. Giữ kỷ lục thời gian.", icon: Grip },
  { id: "wheel", index: "23", group: "play", groupLabel: "Vui chơi", title: "Vòng quay", blurb: "Ai rửa bát, ai trả trà sữa, tối nay đi đâu. Thêm lựa chọn tùy ý.", icon: Orbit },
  { id: "sounds", index: "24", group: "play", groupLabel: "Vui chơi", title: "Hộp âm thanh", blurb: "Tim đập, hôn gió, tiếng mèo, hộp nhạc. Chỉnh được độ lớn.", icon: AudioLines },
  { id: "vault", index: "25", group: "ever", groupLabel: "Mãi mãi", title: "Két bí mật", blurb: "Lời thú nhận và ảnh riêng, mở bằng mật khẩu thứ hai.", icon: LockKeyhole },
  { id: "capsule", index: "26", group: "ever", groupLabel: "Mãi mãi", title: "Viên nang thời gian", blurb: "Viết cho tương lai. Nội dung khóa đến đúng ngày hẹn.", icon: Hourglass },
  { id: "tarot", index: "27", group: "ever", groupLabel: "Mãi mãi", title: "Tarot mỗi ngày", blurb: "Rút một lá cho hôm nay: thông điệp, lời khuyên và chỉ số may.", icon: Sparkles },
  { id: "quiz", index: "28", group: "ever", groupLabel: "Mãi mãi", title: "Độ hiểu nhau", blurb: "Câu hỏi về thói quen của nhau. Sửa đáp án cho đúng với hai bạn.", icon: Brain },
  { id: "certificate", index: "29", group: "ever", groupLabel: "Mãi mãi", title: "Chứng nhận tình yêu", blurb: "Giấy kem chữ ký tay, xuất thành ảnh PNG.", icon: Award },
  { id: "backup", index: "30", group: "ever", groupLabel: "Mãi mãi", title: "Sao lưu", blurb: "Xuất toàn bộ ra JSON để chuyển máy hoặc khôi phục.", icon: Database },
];

export function metaOf(id: ModuleId): ModuleMeta {
  return CATALOG.find((m) => m.id === id) ?? CATALOG[0]!;
}
