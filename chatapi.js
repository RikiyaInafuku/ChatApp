const BASE_URL = "https://assam.tea.ie.u-ryukyu.ac.jp/uiux/";

export async function chat_api(endpoint, body, method = "POST") {
  let res;
  let access_token = Cookies.get("token");
  try {
    if (method == "POST") {
      res = await axios.post(BASE_URL + endpoint + "/", body, {
        headers: {
          token: access_token,
        },
      });
    } else if (method == "DELETE") {
      res = await axios.delete(BASE_URL + endpoint + "/", {
        headers: {
          token: access_token,
        },
      });
    } else if (method == "PUT") {
      res = await axios.put(BASE_URL + endpoint + "/", body, {
        headers: {
          token: access_token,
        },
      });
    } else {
      res = await axios.get(BASE_URL + endpoint + "/", {
        headers: {
          token: access_token,
        },
      });
    }
  } catch (e) {
    const res = e.response;

    if (res.status == 401) {
      console.log("ログインしていない", res);
      throw e;
    } else {
      console.log(`api error:endpoint ${endpoint}, body ${body}`);
      throw e;
    }
  }

  return res.data;
}

export async function signin(username, password) {
  const res = await chat_api("signin", { username, password });
  if (res.result == "OK") {
    // access_token = res.token;
    Cookies.set("token", res.token);
  }
  return res;
}

export async function me() {
  try {
    const res = await chat_api("me", undefined, "GET");
    return res;
  } catch (e) {
    const res = e.response;
    if (res.status == 401) {
      return undefined;
    }
  }
}

export async function signout() {
  return await chat_api("logout", undefined, "GET");
}

export async function post_message(room_name, reciever_id, text) {
  const body = { room_name, reciever_id, text };
  return await chat_api("message", body);
}

export async function get_messages(room_name) {
  return await chat_api(`messages/${room_name}`, undefined, "GET");
}

export async function update_message(id, text) {
  const body = { room_name: "", reciever_id: "", text };
  return await chat_api(`message/${id}`, body, "PUT");
}

export async function delete_message(id) {
  return await chat_api(`message/${id}`, undefined, "DELETE");
}

export async function delete_all_messages(room_name) {
  return await chat_api(`messages/${room_name}`, undefined, "DELETE");
}

function get_token() {
  return Cookies.get("token");
}

export class ChatClinet {
  onopen = () => {
    console.log("connected");
  };

  onmessage = (message) => {
    console.log(message);
  };

  onreload = () => {
    console.log("Reload requested.");
  };

  web_socket = null;

  constructor() {}

  connect() {
    //webソケットの設定（リアルタイムに全ユーザーにメッセージを送信する）
    this.web_socket = new WebSocket("wss:" + BASE_URL.slice(6) + "ws2");
    this.web_socket.onopen = (e) => {
      this.onopen();
    };
    this.web_socket.onmessage = (e) => {
      const m = JSON.parse(e.data);

      if (m.type == "reload") {
        this.onreload();
      } else {
        this.onmessage(m);
      }
    };
  }

  async post_message(room_name, reciever_id, text) {
    const token = get_token();
    const body = { room_name, reciever_id, text, token };
    await this.web_socket.send(JSON.stringify(body));
  }

  async get_messages(room_name) {
    return get_messages(room_name);
  }

  async request_reload() {
    const token = get_token();
    const body = { type: "reload", token };
    await this.web_socket.send(JSON.stringify(body));
  }

  async update_message(id, text) {
    const res = await update_message(id, text);
    if (res.ok) {
      this.request_reload();
    }
    return res;
  }

  async delete_message(id) {
    const result = await delete_message(id);
    if (result.ok) {
      this.request_reload();
    }
    return result;
  }

  async delete_all_messages(room_name) {
    const res = await delete_all_messages(room_name);
    if (res.ok) {
      this.request_reload();
    }
    return res;
  }
}
