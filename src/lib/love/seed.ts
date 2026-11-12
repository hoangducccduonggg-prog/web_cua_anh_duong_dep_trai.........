import type {
  Bucket,
  EventItem,
  Letter,
  Movie,
  Persisted,
  Place,
  QuizQ,
  Relic,
  Settings,
  Star,
  Voucher,
  WheelOpt,
} from "./types";

export const TAROT_DECK: { id: string; name: string; line: string; advice: string }[] = [
  { id: "lantern", name: "Đèn lồng", line: "Một lời chưa nói đang chờ được thắp.", advice: "Nhắn một câu thật ngắn trước khi ngủ. Đừng đợi cho đúng lúc." },
  { id: "bridge", name: "Cây cầu", line: "Hai bờ vẫn nhìn thấy nhau.", advice: "Nếu đang hờn, hãy nói nhu cầu thay vì nói lỗi." },
  { id: "rain", name: "Mưa hiên", line: "Ở yên cũng là một cách đi cùng.", advice: "Dành 15 phút không điện thoại, chỉ ngồi cạnh nhau." },
  { id: "seed", name: "Hạt mầm", line: "Điều nhỏ hôm nay sẽ thành nhánh ngày mai.", advice: "Làm một việc nhà thật cụ thể cho nhau, không cần tuyên bố." },
  { id: "moon", name: "Trăng non", line: "Chưa tròn vẫn đủ sáng đường về.", advice: "Khen một chi tiết thật, không khen chung chung." },
  { id: "cup", name: "Tách trà", line: "Hơi nóng giữ được khi có người chờ.", advice: "Hỏi hôm nay mệt chỗ nào, rồi nghe hết câu trả lời." },
  { id: "key", name: "Chiếc chìa", line: "Cửa không khóa bằng sự im lặng.", advice: "Chia một nỗi lo nhỏ trước khi nó thành bức tường." },
  { id: "boat", name: "Con thuyền", line: "Cùng hướng quan trọng hơn cùng tốc độ.", advice: "Chốt một kế hoạch cuối tuần thật vừa sức." },
  { id: "star", name: "Sao chỉ đường", line: "Có người đang để đèn sáng hộ bạn.", advice: "Gửi định vị hoặc giờ về, cho nhau yên tâm." },
  { id: "thread", name: "Sợi chỉ", line: "Những ngày thường mới là mối khâu chắc.", advice: "Giữ một nghi thức nhỏ: chào buổi sáng, chúc ngủ ngon." },
  { id: "garden", name: "Vườn sau", line: "Hoa không nở vì bị giục.", advice: "Bớt kiểm tra, thêm hỏi thăm. Để người kia có nhịp của họ." },
  { id: "letter", name: "Phong bì", line: "Chữ viết chậm hơn tin nhắn, nên ở lại lâu hơn.", advice: "Viết bốn dòng vào tủ thư, không cần hoàn hảo." },
  { id: "window", name: "Ô cửa", line: "Nhìn ra ngoài cùng nhau làm căn phòng rộng hơn.", advice: "Đi bộ một vòng gần nhà, không cần điểm đến." },
  { id: "drum", name: "Nhịp tim", line: "Nhịp đều hơn nhịp nhanh.", advice: "Nếu cãi nhau, hẹn giờ nói lại khi cả hai đã ăn." },
  { id: "map", name: "Tấm bản đồ", line: "Lạc vẫn ổn nếu nắm tay.", advice: "Chọn một nơi mới trong thành phố và đặt lịch." },
  { id: "flame", name: "Ngọn nến", line: "Sáng vừa đủ để thấy mặt nhau.", advice: "Tắt bớt đèn, kể một kỷ niệm cũ trong mười phút." },
  { id: "nest", name: "Tổ ấm", line: "Nhà là chỗ được phép mệt.", advice: "Chủ động nhận một việc người kia đang ngại nhờ." },
  { id: "compass", name: "La bàn", line: "Hướng về nhau không có nghĩa là giống nhau.", advice: "Hỏi một câu về ước muốn tháng này, rồi ghi vào sổ 100 điều." },
];

export const CITY_POS: Record<string, { x: number; y: number }> = {
  "Hà Nội": { x: 46, y: 28 },
  "Sa Pa": { x: 38, y: 16 },
  "Hạ Long": { x: 58, y: 24 },
  "Huế": { x: 52, y: 48 },
  "Đà Nẵng": { x: 56, y: 54 },
  "Hội An": { x: 58, y: 58 },
  "Đà Lạt": { x: 50, y: 72 },
  "Nha Trang": { x: 64, y: 68 },
  "Sài Gòn": { x: 46, y: 84 },
  "Phú Quốc": { x: 30, y: 88 },
};

const BUCKETS = [
  "Ngắm bình minh cùng nhau",
  "Nấu một bữa cơm không đặt đồ ăn",
  "Chụp ảnh photobooth",
  "Xem một phim đến hết credit",
  "Uống trà sữa hai ly một ống hút",
  "Nghe mưa dưới hiên",
  "Viết thư tay bỏ vào túi",
  "Hát chung một bài, dù lạc tông",
  "Picnic ở công viên gần nhà",
  "Đi bộ không có điểm đến",
  "Cùng xếp một playlist",
  "Nằm đếm sao hoặc đếm trần nhà",
  "Tặng nhau món quà tự làm",
  "Đi chợ và nấu theo đồ vừa mua",
  "Chụp ảnh bóng đổ lúc chiều",
  "Học một công thức bánh",
  "Dậy sớm đón nhau một lần",
  "Đi thư viện và chọn hộ một cuốn",
  "Xem pháo hoa hoặc đèn trời",
  "Cùng hoàn thành một trò xếp hình",
  "Đổi ảnh đại diện thành ảnh đôi",
  "Viết danh sách điều biết ơn",
  "Massage vai mười phút",
  "Đi ăn món người kia thích nhất",
  "Chụp lại bàn tay nắm nhau",
  "Nghe một album từ đầu đến cuối",
  "Cắm một bình hoa rẻ",
  "Vẽ chân dung nguệch ngoạc của nhau",
  "Đi xe buýt đến trạm xa hơn thường lệ",
  "Xem mặt trời lặn không chụp ảnh",
  "Gói quà thật vụng cho nhau",
  "Kể chuyện ngày còn bé",
  "Cùng dọn một góc bàn học",
  "Đặt tên cho một cây gần nhà",
  "Viết nhật ký song song một tuần",
  "Thử một món chua cay mới",
  "Đi bảo tàng hoặc triển lãm",
  "Ngủ trưa cùng một playlist mưa",
  "Chụp ảnh mái tóc trong gió",
  "Học gấp một con hạc giấy",
  "Đổi vai: người hay nấu được nghỉ",
  "Xem lại tin nhắn ngày đầu",
  "Đi cà phê và ngồi quá hai tiếng",
  "Lên kế hoạch một chuyến cuối tuần",
  "Tặng nhau voucher tự chế",
  "Cùng tưới một chậu cây thật",
  "Chơi một ván cờ hoặc bài",
  "Ghi âm giọng hát gửi nhau",
  "Đi mua sách cũ",
  "Nấu chè hoặc món ngọt",
  "Xem một trận mưa từ cửa sổ",
  "Chụp photostrip bằng điện thoại",
  "Viết điều ước vào đèn lồng trong app",
  "Đánh dấu đủ 10 địa điểm trên bản đồ",
  "Hoàn thành 30 điều trong sổ này",
  "Đón sinh nhật không cần tiệc lớn",
  "Tự làm bánh kem vụng về",
  "Xem phim hoạt hình tuổi thơ",
  "Đi dạo sau cơn mưa",
  "Chụp ảnh gương mặt buồn ngủ",
  "Cùng học một từ mới mỗi ngày trong tuần",
  "Gửi thư tương lai một năm",
  "In một tấm ảnh và kẹp vào ví",
  "Đặt lịch gọi video nếu xa nhau",
  "Nấu mì đêm khuya",
  "Nghe nhạc và không nói gì 10 phút",
  "Kể một nỗi sợ nhỏ",
  "Cùng xếp chăn mền cho phẳng",
  "Đi ăn sáng rất sớm",
  "Vẽ bản đồ con đường hay đi",
  "Chọn một bài hát của hai đứa",
  "Tặng hoa mua ở cổng, không cần shop",
  "Xem ảnh cũ và kể lại",
  "Viết lời chúc sinh nhật trước một tuần",
  "Đi thử một môn thể thao nhẹ",
  "Cùng làm một playlist mưa",
  "Chụp bóng hai người trên tường",
  "Hẹn nhau một ngày không cãi",
  "Nấu ăn thất bại rồi cười",
  "Đi mua trà sữa lúc trời lạnh",
  "Ghi lại câu nói làm mình cười nhất",
  "Xem một vở kịch hoặc liveshow rẻ",
  "Đếm đủ 365 ngày và chụp ảnh",
  "Làm giấy chứng nhận có chữ ký",
  "Cất một vật nhỏ vào hộp kỷ vật",
  "Đi xe vòng quanh hồ",
  "Ngắm mái nhà lúc đèn đường bật",
  "Viết 10 lý do thương nhau",
  "Cùng chọn hình xăm tạm bằng sticker",
  "Dạy nhau một kỹ năng vụn",
  "Đón nhau tan học hoặc tan ca",
  "Ăn chung một gói snack đến hết",
  "Chụp ảnh chân dung nghiêm túc rồi phá lên",
  "Hẹn một ngày không mạng xã hội",
  "Làm album in giấy khi đủ 12 ảnh",
  "Viết thư cho bản thân năm sau",
  "Trồng một hạt và theo dõi cùng nhau",
  "Đi lạc có chủ đích trong một khu phố",
  "Kết thúc ngày bằng câu chúc ngủ ngon",
];

const defaultSettings = (): Settings => ({
  nameA: "Dương",
  nameB: "Dung",
  nickA: "Anh Dương",
  nickB: "Em Bé Dung",
  startDate: "2026-06-27",
  birthdayA: "2009-11-19",
  birthdayB: "2026-12-10",
  avatarA: "",
  avatarB: "",
  syncCode: "DD-2706",
  pin: "1012",
  vaultPin: "2706",
  me: "a",
  cloudSync: false,
});

function letters(): Letter[] {
  const from = (title: string, body: string, who: "a" | "b", day: number): Letter => ({
    id: `letter-${day}`,
    title,
    body,
    from: who,
    sealed: true,
    createdAt: new Date(2026, 6, day, 21, 0, 0).getTime(),
  });
  return [
    from(
      "Ngày mình bắt đầu đếm",
      "Anh không giỏi những câu thật dài. Nhưng anh nhớ rất rõ chiều 27 tháng 6, em đứng nghiêng một chút để tránh nắng, và anh biết từ giờ mỗi ngày sẽ có một con số để giữ.\n\nNếu có lúc anh vụng, em cứ kéo anh lại bằng một câu ngắn. Anh sẽ trả lời. Không phải vì app nhắc, mà vì em là người anh muốn kể chuyện trước khi ngủ.\n\nHôm nay anh viết lá thư này để sau này mở ra vẫn thấy mình đã chọn em từ rất sớm, không phải đợi cho đủ lớn chuyện.",
      "a",
      2,
    ),
    from(
      "Những điều em không nhắn kịp",
      "Có những câu em gõ rồi xóa. Không phải vì không thương, mà vì sợ nói ra nghe tham. Em muốn anh ăn đúng giờ. Em muốn anh đừng nói “không sao” khi có sao. Em muốn ngày sinh nhật anh năm nay có một cái bánh hơi lệch, vì bánh lệch mới là bánh của hai đứa.\n\nNếu anh đọc thư này lúc đang bận, cứ cất đi. Em không cần trả lời hay. Em chỉ cần anh biết em vẫn ở phía này của ngày.",
      "b",
      18,
    ),
    from(
      "Hẹn một năm nữa",
      "Mình hẹn nhau: đến đúng ngày này năm sau sẽ mở một viên nang, kể xem năm ấy ai đã trưởng thành hơn một chút. Không cần thành tích. Chỉ cần còn muốn kể cho nhau nghe.\n\nAnh sẽ học cách hỏi em đang mệt hay đang buồn. Em sẽ học cách nói trước khi im. Và cả hai sẽ giữ cái mốc 27 tháng 6 như người ta giữ một chiếc chìa khóa — nhỏ, nhưng mở được cửa về.",
      "a",
      27,
    ),
  ];
}

function stars(): Star[] {
  return [
    { id: "s1", x: 0.22, y: 0.28, name: "Dương", text: "Anh từng định nói thích em từ một câu chuyện rất nhỏ, rồi thôi, vì sợ sớm. Bây giờ không sớm nữa.", found: false },
    { id: "s2", x: 0.48, y: 0.18, name: "Dung", text: "Em giữ tấm ảnh chụp vội ngày mưa. Không đẹp, nhưng có anh đang cười lệch.", found: false },
    { id: "s3", x: 0.72, y: 0.32, name: "Mốc", text: "100 ngày không phải đích. Nó chỉ là chỗ mình ngoảnh lại và thấy vẫn muốn đi tiếp.", found: false },
    { id: "s4", x: 0.3, y: 0.58, name: "Hẹn", text: "Nếu lạc nhau giữa đám đông, mình gặp ở quán có đèn vàng nhất.", found: false },
    { id: "s5", x: 0.62, y: 0.62, name: "Nhà", text: "Nhà có thể chỉ là một cuộc gọi đúng giờ. Miễn là có người bắt máy.", found: false },
    { id: "s6", x: 0.84, y: 0.48, name: "Sau", text: "Năm sau mình vẫn viết. Dù chữ xấu hơn năm nay cũng được.", found: true },
  ];
}

function relics(): Relic[] {
  return [
    { id: "r1", title: "Vé xem phim đầu tiên", year: "2026", story: "Hai đứa đến sớm 20 phút và vẫn suýt ngồi nhầm hàng. Vé nhàu vì để chung túi với kẹo. Điều đáng giữ không phải tên phim, mà là lúc đèn tắt và tay ai đó tìm tay ai đó hơi chậm." },
    { id: "r2", title: "Món quà đầu", year: "2026", story: "Không đắt. Một món nhỏ mua vì thấy hợp, không vì ngày lễ. Người nhận giữ túi giấy dù quà đã lấy ra, vì trên túi có chữ viết vội." },
    { id: "r3", title: "Tin nhắn ngủ ngon đầu tiên", year: "2026", story: "Chỉ một dòng. Không sticker. Nhưng hôm sau cả hai đều mở lại để chắc là mình không mơ. Từ đó câu ấy thành nghi thức, dù đôi khi gửi muộn." },
    { id: "r4", title: "Ly nước dùng chung", year: "2026", story: "Hết một nửa mới nhớ ra là quên gọi hai ly. Không ai phàn nàn. Đó là lần đầu tiên một sự vụng về trở thành kỷ niệm có chủ đích." },
    { id: "r5", title: "Ảnh chụp lệch", year: "2026", story: "Máy chụp sớm hơn nụ cười. Một người đang nhìn máy, một người đang nhìn người kia. Về sau nhìn lại, tấm lệch này thật hơn tấm chỉnh kỹ." },
    { id: "r6", title: "Chiếc kẹp tóc mượn", year: "2026", story: "Mượn một phút rồi quên trả. Nó nằm trong túi áo như một chứng cứ dễ thương rằng có người đã đứng rất gần." },
  ];
}

function vouchers(): Voucher[] {
  return [
    { id: "v1", title: "Miễn giận một lần", detail: "Được phép nguôi ngay, không truy lại chuyện cũ trong ngày đó.", stock: 3, used: 0 },
    { id: "v2", title: "Trà sữa full topping", detail: "Người kia trả, không được phép nói câu cho bớt ngọt.", stock: 4, used: 1 },
    { id: "v3", title: "Ôm chặt năm phút", detail: "Đếm đủ giờ. Không được rút tay vì ngại.", stock: 5, used: 0 },
    { id: "v4", title: "Được chọn phim", detail: "Quyền quyết định buổi xem, người kia không được rên.", stock: 3, used: 0 },
    { id: "v5", title: "Massage mười phút", detail: "Vai hoặc đầu. Người nhận phải khen thật.", stock: 4, used: 0 },
    { id: "v6", title: "Một bữa người kia nấu", detail: "Dù chỉ là mì. Người nấu được miễn chê trình bày.", stock: 3, used: 0 },
  ];
}

function places(): Place[] {
  const rows: Omit<Place, "id">[] = [
    { name: "Ghế đá công viên", city: "Hà Nội", note: "Chỗ ngồi lần đầu kể chuyện học hành hơi dài.", rating: 5, visited: true, ...CITY_POS["Hà Nội"] },
    { name: "Quán trà sữa góc phố", city: "Hà Nội", note: "Hai ly một ống. Nhân viên cười.", rating: 4, visited: true, x: 50, y: 32 },
    { name: "Rạp chiếu gần nhà", city: "Sài Gòn", note: "Vé đầu tiên, hàng ghế hơi lệch.", rating: 5, visited: true, ...CITY_POS["Sài Gòn"] },
    { name: "Hồ lúc đèn vừa bật", city: "Hà Nội", note: "Chưa có ảnh đẹp, chỉ có gió.", rating: 4, visited: false, x: 42, y: 30 },
    { name: "Đà Lạt sớm", city: "Đà Lạt", note: "Kế hoạch ngắm bình minh, chưa đi.", rating: 0, visited: false, ...CITY_POS["Đà Lạt"] },
    { name: "Phố đèn lồng", city: "Hội An", note: "Muốn thả một điều ước ngoài đời, không chỉ trong app.", rating: 0, visited: false, ...CITY_POS["Hội An"] },
    { name: "Biển cuối tuần", city: "Đà Nẵng", note: "Ghi vào sổ để khỏi quên mình đã hứa.", rating: 0, visited: false, ...CITY_POS["Đà Nẵng"] },
    { name: "Quầy sách cũ", city: "Huế", note: "Chọn hộ nhau một cuốn, không cần cùng gu.", rating: 0, visited: false, ...CITY_POS["Huế"] },
  ];
  return rows.map((p, i) => ({ ...p, id: `place-${i + 1}` }));
}

function movies(): Movie[] {
  const rows: Omit<Movie, "id">[] = [
    { title: "Your Name", status: "done", score: 9, note: "Xem chung, im hết phần credit." },
    { title: "Before Sunrise", status: "want", score: 0, note: "Dành cho một tối không vội." },
    { title: "Flipped", status: "want", score: 0, note: "Em muốn xem vì cái cây." },
    { title: "Our Times", status: "watching", score: 0, note: "Đang xem dở một tập." },
    { title: "About Time", status: "want", score: 0, note: "Để dành ngày mưa." },
    { title: "The Lunchbox", status: "want", score: 0, note: "Hợp một bữa ăn tối chậm." },
    { title: "Little Women", status: "done", score: 8, note: "Cãi nhau nhẹ về đoạn kết, rồi hòa." },
    { title: "Spirited Away", status: "want", score: 0, note: "Xem khi cần dịu lại." },
  ];
  return rows.map((m, i) => ({ ...m, id: `movie-${i + 1}` }));
}

function quiz(): QuizQ[] {
  const rows: Omit<QuizQ, "id">[] = [
    { prompt: "Món Dương hay gọi khi đói đêm?", options: ["Mì cay", "Cơm rang", "Trà sữa", "Bánh mì"], answer: 0 },
    { prompt: "Màu Dung mặc nhiều nhất?", options: ["Đen", "Trắng", "Be", "Xanh đậm"], answer: 2 },
    { prompt: "Dương thích được nhắn kiểu nào?", options: ["Thả tim", "Một câu cụ thể", "Gọi voice", "Gửi ảnh"], answer: 1 },
    { prompt: "Dung ghét nhất điều gì khi hẹn?", options: ["Đến muộn không báo", "Ồn", "Đói", "Bị thúc chọn món"], answer: 0 },
    { prompt: "Buổi Dung tỉnh táo hơn?", options: ["Sáng sớm", "Trưa", "Tối", "Khuya"], answer: 3 },
    { prompt: "Quà Dương thấy có ích?", options: ["Đồ lưu niệm", "Đồ ăn", "Thời gian được đón", "Hoa"], answer: 2 },
    { prompt: "Phim Dung dễ khóc?", options: ["Hoạt hình", "Tình cảm chậm", "Gia đình", "Không khóc"], answer: 1 },
    { prompt: "Dương uống gì khi học?", options: ["Nước lọc", "Cà phê", "Trà", "Nước ngọt"], answer: 2 },
    { prompt: "Ngày Dung muốn được yên?", options: ["Khi điểm kém", "Khi đông người", "Khi thiếu ngủ", "Cả ba"], answer: 3 },
    { prompt: "Chỗ Dương muốn đi nếu được chọn ngay", options: ["Biển", "Đà Lạt", "Ở nhà nấu ăn", "Rạp phim"], answer: 2 },
    { prompt: "Dung để ý điều nhỏ nào?", options: ["Được hỏi han", "Được nhớ món", "Được đợi", "Tất cả"], answer: 3 },
    { prompt: "Bài kiểm tra này nên kết thúc bằng gì?", options: ["Một cái ôm", "Một ly trà sữa", "Một lời hứa nhỏ", "Tùy người thua"], answer: 0 },
  ];
  return rows.map((q, i) => ({ ...q, id: `quiz-${i + 1}` }));
}

function wheel(): WheelOpt[] {
  return ["Ai rửa bát?", "Ai trả trà sữa?", "Tối nay đi đâu?", "Xem phim gì?", "Ai nhắn trước?", "Ôm bao lâu?", "Ai chọn nhạc?", "Mai ai dậy sớm?"].map(
    (label, i) => ({ id: `wheel-${i + 1}`, label }),
  );
}

function events(): EventItem[] {
  const rows: Omit<EventItem, "id">[] = [
    { title: "Valentine", month: 2, day: 14, remind: true },
    { title: "Quốc tế phụ nữ", month: 3, day: 8, remind: true },
    { title: "Ngày của bé", month: 6, day: 1, remind: false },
    { title: "Phụ nữ Việt Nam", month: 10, day: 20, remind: true },
    { title: "Giáng sinh", month: 12, day: 25, remind: true },
    { title: "Tết Dương lịch", month: 1, day: 1, remind: true },
  ];
  return rows.map((e, i) => ({ ...e, id: `event-${i + 1}` }));
}

export function freshState(): Persisted {
  const bucket: Bucket[] = BUCKETS.map((title, i) => ({
    id: `bucket-${i + 1}`,
    title,
    done: i < 4,
    doneOn: i < 4 ? `2026-07-0${i + 2}` : "",
  }));
  return {
    settings: defaultSettings(),
    today: {
      food: "Trà sữa ít đá",
      buy: "Một cuốn sổ nhỏ",
      mood: "Nhớ",
      place: "Nhà",
      note: "Tối nay gọi nhau trước 22 giờ.",
      at: Date.now(),
      by: "a",
    },
    pings: [
      { id: "ping-1", text: "Anh nhớ em", from: "a", at: Date.now() - 3600_000 },
      { id: "ping-2", text: "Em vừa học xong", from: "b", at: Date.now() - 1800_000 },
    ],
    letters: letters(),
    photos: [],
    albumSeeded: false,
    cakeWish: "Thêm một tuổi nữa, mình vẫn chọn nhau vào những ngày rất thường.",
    tree: {
      water: 4,
      feed: 2,
      wishes: [
        { id: "wish-1", text: "Còn được kể chuyện cho nhau nghe" },
        { id: "wish-2", text: "Một chuyến đi ngắn, không cần xa" },
      ],
      lastWater: "",
      lastFeed: "",
    },
    stars: stars(),
    globe: { tint: "rose", photoId: "" },
    relics: relics(),
    lanterns: [
      { id: "lantern-1", wish: "Mình còn dịu với nhau vào những ngày mệt.", at: Date.now() - 86_400_000, by: "b" },
      { id: "lantern-2", wish: "Đủ sức học, đủ sức thương.", at: Date.now() - 43_200_000, by: "a" },
    ],
    pet: {
      name: "Mochi",
      kind: "cat",
      hunger: 78,
      joy: 82,
      clean: 70,
      xp: 24,
      accessory: 0,
      lastTick: Date.now(),
    },
    journal: [
      { id: "journal-1", date: "2026-11-01", mood: "nho", text: "Hôm nay bận nhưng vẫn kịp một câu hỏi thăm. Như vậy là đủ để ngày không trống.", author: "a" },
      { id: "journal-2", date: "2026-11-10", mood: "vui", text: "Được đón đúng giờ. Vui theo kiểu rất nhỏ, rất thật.", author: "b" },
    ],
    vouchers: vouchers(),
    places: places(),
    bucket,
    events: events(),
    tracks: [],
    movies: movies(),
    drawings: [],
    puzzleBestMs: null,
    wheel: wheel(),
    volume: 0.7,
    vaultItems: [],
    capsules: [
      {
        id: "capsule-1",
        title: "Gửi hai đứa năm sau",
        body: "Nếu đang đọc dòng này thì mình đã đi qua thêm một vòng sinh nhật và rất nhiều ngày thường. Hãy kể: ai đã học nấu món mới, ai vẫn quên ô, và mình còn muốn hẹn nhau điều gì.",
        openOn: "2027-06-27",
        createdAt: Date.now(),
      },
    ],
    tarot: null,
    tarotLog: [],
    quiz: quiz(),
    scores: { a: 0, b: 0 },
    signature: "",
    certNote: "Hai đứa chọn nhau, mỗi ngày một chút, không cần chứng minh với ai khác.",
  };
}

export function nickOf(settings: Settings, who: "a" | "b"): string {
  return who === "a" ? settings.nickA : settings.nickB;
}

export function nameOf(settings: Settings, who: "a" | "b"): string {
  return who === "a" ? settings.nameA : settings.nameB;
}

export const MOODS: { id: string; label: string }[] = [
  { id: "Vui", label: "Vui" },
  { id: "Nhớ", label: "Nhớ" },
  { id: "Hờn", label: "Hờn một chút" },
  { id: "Mệt", label: "Mệt" },
  { id: "Bình yên", label: "Bình yên" },
  { id: "Háo hức", label: "Háo hức" },
];

export const QUICK_PINGS = [
  "Anh nhớ em",
  "Em nhớ anh",
  "Đang qua đón",
  "Ăn cơm chưa?",
  "Ngủ ngon nha",
  "Tự hào về em",
  "Hôm nay mệt một chút",
  "Gọi anh khi xong",
];

export const JOURNAL_MOODS: { id: "vui" | "nho" | "hon" | "hanh"; label: string }[] = [
  { id: "vui", label: "Vui" },
  { id: "nho", label: "Nhớ" },
  { id: "hon", label: "Hờn" },
  { id: "hanh", label: "Hạnh phúc" },
];
