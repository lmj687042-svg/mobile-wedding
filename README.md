# 모바일 청첩장 사용법

## 폴더 구조
```
mobile-wedding/
├─ index.html      ← 마크업 구조
├─ style.css       ← 스타일
├─ script.js       ← 동작 로직 (config.json을 불러와 화면에 반영)
├─ config.json      ← ★ 신랑/신부/날짜/장소 등 실제 정보는 여기만 수정하면 됨
└─ images/
   ├─ hero/1.jpg          ← 커버 사진
   ├─ story/1.jpg,2.jpg   ← 스토리 사진 (선택)
   ├─ gallery/1.jpg,2.jpg,3.jpg ...  ← 갤러리 사진 (숫자 순서대로, 자동 인식)
   ├─ map/1.jpg           ← 약도 이미지
   └─ og/1.jpg            ← 카카오톡 공유 미리보기 이미지
```

## 1. config.json 채우기
현재 알고 있는 정보만 미리 채워뒀고, 나머지는 빈 값(`""`)으로 남겨뒀습니다.

- `wedding.time` : 예식 시각 (예: `"14:00"`)
- `wedding.address` : 아펠가모 선릉 상세 주소
- `wedding.tel` : 예식장 전화번호
- `location.subway` / `bus` / `parking` : 교통 안내 문구
- `location.kakao` / `naver` : 실제 지도 공유 링크

## 2. 계좌 / 혼주 정보
계좌 정보와 혼주(부모님) 성함은 `config.json`이 아니라 `index.html` 안에 직접 적혀 있습니다.
`index.html`에서 `○○○`, `000-0000-0000` 로 표시된 부분을 검색해서 실제 정보로 바꿔주세요.
(04 ACCOUNT 섹션, 01 WITH LOVE 섹션의 family 부분)

## 3. 이미지 넣기
각 `images/` 하위 폴더의 `README.txt`에 적힌 파일명 규칙대로 사진만 넣으면 됩니다.
갤러리는 `1.jpg`부터 순서대로 존재하는 파일까지 자동으로 불러옵니다.

## 4. 미리보기 방법 (중요)
`index.html`을 더블클릭해서 바로 열면 `config.json`을 못 불러와 빈 화면이 뜹니다.
(브라우저 보안 정책상 file:// 로 열면 fetch가 차단됨)

아래 중 하나로 열어야 정상 동작합니다.
- VS Code의 "Live Server" 확장 사용
- 터미널에서 폴더로 이동 후 `python -m http.server` 실행 → `http://localhost:8000` 접속
- Netlify Drop, GitHub Pages 등 실제 호스팅에 폴더째 업로드

## 5. 참고
- 하트 위치 관련 CSS는 이미 `style.css`의 `.section-title-wrap` 관련 부분에 반영되어 있습니다.
- 예식일은 2027년 1월 2일, 장소는 아펠가모 선릉(채플식)으로 `config.json`에 미리 입력해뒀습니다.
