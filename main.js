import * as chatapi from "./chatapi.js";

const ROOM_NAME = "prog1_bbs";

function dom(id) {
  return document.getElementById(id);
}

//サインイン済みか判断し、適切なフォームを表示する
function check_signin() {
  // サインイン処理
  dom("signin").onclick = async () => {
    const username = dom("username").value;
    const password = dom("password").value;
    await chatapi.signin(username, password);

    // サインインが成功したらデフォルトルームを設定し、メッセージをリロード
    dom("room_name").innerText = ROOM_NAME; // デフォルトの部屋名を設定
    await reload_messages();
    check_signin(); // サインイン状態を確認
  };

  // サインアウト処理
  dom("signout").onclick = async () => {
    await chatapi.signout();
    clear_messagees();
    check_signin();
  };

  // ログイン済みか確認してUIを切り替え
  chatapi.me().then((user) => {
    const returnButton = dom("return_to_default_room");
    if (!returnButton) {
      console.error(
        "return_to_default_room button is missing during check_signin"
      );
    }

    if (user) {
      // ログイン済み：チャット機能を表示
      dom("user").innerText = `username:${user.username}`;
      dom("user_info").hidden = false;
      dom("singin_form").hidden = true;
      dom("chat_features").hidden = false;
      dom("sidebar").hidden = false;
      reload_messages(); // メッセージをリロード
    } else {
      // 未ログイン：ログインフォームを表示
      dom("user_info").hidden = true;
      dom("singin_form").hidden = false;
      dom("chat_features").hidden = true;
      dom("sidebar").hidden = true;
    }
  });
}

// ページ読み込み時に実行されるコード
window.onload = function () {
  // ログイン状態の確認（cookieやlocalStorageを使って確認）
  const username = localStorage.getItem("username"); // ログインしたユーザー名をローカルストレージから取得
  const savedRoomName = localStorage.getItem("currentRoom") || ROOM_NAME; // 保存された部屋名またはデフォルト部屋

  if (username) {
    // ログイン済みの場合、チャット機能を表示、ログインフォームを非表示
    document.getElementById("chat_features").style.display = "flex";
    document.getElementById("singin_form").style.display = "none";
    document.getElementById("user").textContent = username; // ユーザー名を表示
    // 保存された部屋名を表示に反映
    dom("room_name").innerText = savedRoomName;
    reload_messages(); // メッセージをリロード
    update_return_button_visibility(); // ボタンの表示/非表示を更新
  } else {
    // ログインしていない場合、ログインフォームを表示
    document.getElementById("chat_features").style.display = "none";
    document.getElementById("singin_form").style.display = "block";
  }
};

// サインイン処理
document.getElementById("signin").addEventListener("click", function () {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // ユーザー名とパスワードが正しい場合、サインイン成功
  if (username && password) {
    localStorage.setItem("username", username); // ログイン情報をローカルストレージに保存
    document.getElementById("chat_features").style.display = "flex";
    document.getElementById("singin_form").style.display = "none";
    document.getElementById("user").textContent = username;
  } else {
    alert("ユーザー名とパスワードを入力してください！");
  }
});

// サインアウト処理
document.getElementById("signout").addEventListener("click", function () {
  localStorage.removeItem("username"); // ローカルストレージからログイン情報を削除
  document.getElementById("chat_features").style.display = "none";
  document.getElementById("singin_form").style.display = "block";
});

//チャットルーム名を取得(inputタグより)
function get_room_name() {
  const roomName =
    dom("room_name").innerText || localStorage.getItem("currentRoom");
  return roomName ? roomName : ROOM_NAME; // 保存された部屋名がない場合はデフォルト値を返す
}

//xssを防ぐ必要があります(xssは検索してください)
const white_list = {
  whiteList: {
    //許可するhtmlタグと属性のリスト
    b: [],
    i: [],
    s: [],
    u: [],
    font: [],
    pre: [],
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    table: [],
    tr: [],
    td: [],
    sub: [],
    sup: [],
    br: [],
  },
};
function sanitize_html(html) {
  return filterXSS(html, white_list); //white listにないタグは削除される
}

//指定されたIDの部屋に移動;
function move_to_room_by_id(messageId) {
  const roomName = `uiux_${messageId}`; // 部屋名を生成
  dom("room_name").innerText = roomName; // 表示を更新
  localStorage.setItem("currentRoom", roomName); // 現在の部屋名を保存
  reload_messages(); // メッセージをリロード
  update_return_button_visibility(); // ボタンの表示/非表示を更新
}

// 「prog1_bbsに戻る」ボタンの表示/非表示を切り替える
function update_return_button_visibility() {
  const currentRoom = get_room_name();
  const returnButton = dom("return_to_default_room");

  if (!returnButton) {
    console.warn("return_to_default_room element is null");
    return;
  }

  if (currentRoom === "prog1_bbs") {
    returnButton.hidden = true; // デフォルトの部屋なら非表示
  } else {
    returnButton.hidden = false; // デフォルト以外の部屋なら表示
  }

  // クリックイベントの再設定
  if (!returnButton.onclick) {
    returnButton.onclick = async () => {
      console.log("prog1_bbsに戻るボタンがクリックされました！");
      const defaultRoomName = ROOM_NAME; // デフォルトの部屋名
      dom("room_name").innerText = defaultRoomName; // 表示を更新
      localStorage.removeItem("currentRoom"); // ローカルストレージから currentRoom を削除
      await reload_messages(); // メッセージをリロード
      update_return_button_visibility(); // ボタンの表示/非表示を更新
    };
  }
}

// 最新のメッセージに自動スクロール
function scroll_to_bottom() {
  const container = dom("messages"); // メッセージを表示するコンテナ
  container.scrollTop = container.scrollHeight; // コンテナの一番下までスクロール
}

//全メッセージを削除（表示のみ）
function clear_messagees() {
  const container = dom("messages");
  container.innerHTML = "";
}

// タブキーでインデントできるように変更
document.getElementById("message").addEventListener("keydown", function (e) {
  if (e.key === "Tab") {
    e.preventDefault(); // タブキーのデフォルト動作を無効化

    // 現在のカーソル位置を取得
    const start = this.selectionStart;
    const end = this.selectionEnd;

    // テキストエリア内の内容を取得
    const value = this.value;

    // タブ文字を挿入
    this.value = value.substring(0, start) + "\t" + value.substring(end);

    // カーソル位置を調整
    this.selectionStart = this.selectionEnd = start + 1;
  }
});

// メッセージを追加(表示のみ)
function add_message(m) {
  const container = dom("messages");

  // ログイン中のユーザー名を取得
  const loggedInUser = dom("user").innerText.replace("username:", "").trim();
  const currentRoomName = dom("room_name").innerText.trim(); // 現在のroom_nameを取得

  const message_html = document.createElement("div");
  message_html.classList.add("message");

  // IDと送信者情報の表示部分
  const metadata = document.createElement("div");
  metadata.classList.add("message-metadata");

  const idSpan = document.createElement("span");
  idSpan.textContent = `id: ${m.id}`;
  metadata.appendChild(idSpan);

  if (m.sender_id === loggedInUser || loggedInUser === "admin") {
    const fromSpan = document.createElement("span");
    fromSpan.textContent = ` from: ${m.sender_id}`;
    metadata.appendChild(fromSpan);
  }

  message_html.appendChild(metadata);

  // テキストの表示部分
  const message_content = document.createElement("div");
  message_content.classList.add("message-content");

  const formattedMessage = m.text.replace(
    /```([\s\S]*?)```/g,
    (match, code) => {
      const cleanedCode = sanitize_html(code.trim());
      return `<pre class="code-block">${cleanedCode}</pre>`;
    }
  );

  message_content.innerHTML = sanitize_html(formattedMessage);
  message_html.appendChild(message_content);

  // ボタンを配置するコンテナを作成
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("button-container");

  if (m.sender_id === loggedInUser || loggedInUser === "admin") {
    // 「移動」ボタン
    const move_button = document.createElement("button");
    move_button.textContent = "移動";
    move_button.classList.add("move-button");

    // 現在のroom_nameがprog1_bbs以外の場合、非表示にする
    if (currentRoomName !== "prog1_bbs") {
      move_button.style.display = "none";
    }

    move_button.onclick = () => {
      move_to_room_by_id(m.id);
    };

    // 「削除」ボタン
    const delete_button = document.createElement("button");
    delete_button.textContent = "削除";
    delete_button.classList.add("delete-button");
    delete_button.onclick = async () => {
      try {
        const res = await client.delete_message(m.id);
        if (!res || res.success === false) {
          alert("削除に失敗しました");
        } else {
          message_html.remove();
          // scroll_to_bottom(); // 最新メッセージにスクロール
        }
      } catch (error) {
        console.error("削除エラー:", error);
        alert("削除中にエラーが発生しました");
      }
    };

    // 「編集」ボタン
    const edit_button = document.createElement("button");
    edit_button.textContent = "編集";
    edit_button.classList.add("edit-button");
    edit_button.onclick = () => {
      move_button.style.display = "none"; // 移動ボタンを非表示
      delete_button.style.display = "none"; // 削除ボタンを非表示
      edit_button.style.display = "none"; // 編集ボタンを非表示

      const textarea = document.createElement("textarea");
      textarea.classList.add("edit-textarea");
      textarea.value = m.text;
      message_html.replaceChild(textarea, message_content);

      const save_button = document.createElement("button");
      save_button.textContent = "保存";
      save_button.classList.add("save-button");

      const cancel_button = document.createElement("button");
      cancel_button.textContent = "戻る";
      cancel_button.classList.add("cancel-button");

      save_button.onclick = async () => {
        try {
          const updatedText = textarea.value;
          const res = await client.update_message(m.id, updatedText);
          if (!res || res.success === false) {
            alert("更新に失敗しました");
          } else {
            m.text = updatedText;

            const updatedFormattedMessage = updatedText.replace(
              /```([\s\S]*?)```/g,
              (match, code) => {
                const cleanedCode = sanitize_html(code.trim());
                return `<pre class="code-block">${cleanedCode}</pre>`;
              }
            );

            message_content.innerHTML = sanitize_html(updatedFormattedMessage);
            message_html.replaceChild(message_content, textarea);

            move_button.style.display = "inline-block";
            delete_button.style.display = "inline-block";
            edit_button.style.display = "inline-block";

            buttonContainer.removeChild(save_button);
            buttonContainer.removeChild(cancel_button);

            reload_messages(); // 修正後にリロードしてスクロール
          }
        } catch (error) {
          console.error("更新エラー:", error);
          alert("更新中にエラーが発生しました");
        }
      };

      cancel_button.onclick = () => {
        message_html.replaceChild(message_content, textarea);

        move_button.style.display = "inline-block";
        delete_button.style.display = "inline-block";
        edit_button.style.display = "inline-block";

        buttonContainer.removeChild(save_button);
        buttonContainer.removeChild(cancel_button);
      };

      buttonContainer.appendChild(save_button);
      buttonContainer.appendChild(cancel_button);
    };

    buttonContainer.appendChild(move_button);
    buttonContainer.appendChild(edit_button);
    buttonContainer.appendChild(delete_button);
  }

  message_html.appendChild(buttonContainer);
  container.appendChild(message_html);
}

//サーバーからのレスポンスを表示(おそらく実際のアプリでは、より親切なテキストに変換する必要あり)
function show_server_message(text) {
  console.log("server:" + text);

  // もし 'server_message' が存在すれば、その内容を更新
  // if文を追加し、server_message が存在しない場合にエラーを回避するようにする
  const serverMessageElement = dom("server_message");
  if (serverMessageElement) {
    serverMessageElement.innerText = text;
  }
}

//チャットクライアントオブジェクト作成(websocketなどの制御)
const client = new chatapi.ChatClinet();

//全メッセージを受信し表示を更新
async function reload_messages() {
  const currentRoom = get_room_name(); // 動的に現在の部屋名を取得
  const messages = await client.get_messages(currentRoom); // 現在の部屋名でメッセージを取得

  clear_messagees();
  for (const m of messages) {
    add_message(m);
  }

  // 再度 DOM 要素が存在するか確認
  const returnButton = dom("return_to_default_room");
  if (!returnButton) {
    console.error("return_to_default_room element is missing during reload");
  } else {
    update_return_button_visibility();
  }

  // 明示的に再描画をトリガー
  const container = dom("messages");
  container.style.display = "none"; // 一旦非表示
  container.offsetHeight; // レイアウト再計算を強制
  container.style.display = "block"; // 再表示

  scroll_to_bottom(); // 最新メッセージにスクロール
}

//メイン
async function main() {
  //サインイン済みか確認しフォームの表示などを行う
  check_signin();

  //デフォルトルーム名を設定
  dom("room_name").value = ROOM_NAME;

  //メッセージ受信の処理(websocketによりリアルタイム配信)
  client.onmessage = (m) => {
    add_message(m);
  };

  //メッセージ更新の処理(dbを表示の同期をとる。メッセージが削除された時など。)
  client.onreload = () => {
    reload_messages();
  };

  //websocketの接続要求
  client.onopen = () => {
    show_server_message("connected");
  };
  show_server_message("connecting to chat server...");
  client.connect();

  //room更新ボタンの処理
  dom("reload_messages").onclick = async () => {
    reload_messages();
  };

  //投稿ボタンの処理
  dom("post_message").onclick = async () => {
    const text = dom("message").value;

    // メッセージを送信
    client.post_message(get_room_name(), "None", text);

    // 入力欄を空にする
    dom("message").value = "";

    reload_messages(); // メッセージリロード後にスクロール
  };

  //更新ボタンの処理
  dom("update_message").onclick = async () => {
    const id = dom("update_message_id").value;
    const text = dom("updated_message").value;

    client.update_message(id, text);
  };

  // 「prog1_bbsに戻る」ボタンのクリック処理
  dom("return_to_default_room").onclick = async () => {
    console.log("prog1_bbsに戻るボタンがクリックされました！"); // デバッグ用
    const defaultRoomName = ROOM_NAME; // デフォルトの部屋名
    dom("room_name").innerText = defaultRoomName; // 表示を更新
    localStorage.removeItem("currentRoom"); // ローカルストレージから currentRoom を削除
    console.log("currentRoom removed:", localStorage.getItem("currentRoom")); // 削除後の確認
    await reload_messages(); // メッセージをリロード
    update_return_button_visibility(); // ボタンの表示/非表示を更新
  };

  //削除ボタンの処理
  dom("delete_message").onclick = async () => {
    const id = dom("delete_message_id").value;
    const res = await client.delete_message(id);
    show_server_message(JSON.stringify(res));
  };

  // 個人チャット移動ボタンの処理
  dom("move_to_private_chat").onclick = async () => {
    const roomName = dom("private_room_name").value; // 入力された room 名を取得
    if (roomName) {
      dom("room_name").value = roomName; // 現在の room 名に設定
      reload_messages(); // メッセージをリロード
    } else {
      alert("room 名を入力してください！"); // 空の場合のエラー処理
    }
  };

  //まずは全メッセージ受信
  reload_messages();
}

main();
