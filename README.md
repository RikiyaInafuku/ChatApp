## 実行方法
index.htmlがあるディレクトリで
% python3 -m http.server
などと実行すると

http://localhost:8000/index.html

からアクセス可能です。

または、適当なサーバーにあげても構いません。

本サンプルコードのUIの評価をしてはいけません．これは改良する対象ではありません．
あくまでもAPIの使い方の事例です．

## ユーザ登録の方法
https://assam.tea.ie.u-ryukyu.ac.jp/uiux/static/signup.html
適当なユーザ名とパスワードを入力してsignup
パスワードはできるだけ頑健に。
ユーザ名は他の学生、他のグループと被らないように注意

すでに登録済みのユーザ名を入力すると
Internal Server Error
となるので，できるだけユニークなユーザ名を指定してください

## チャットルーム名について
チャットルーム名でチャットグループを区別できるようになっています。
そのままの状態だと、test_roomというルームが立ち上がります。

## (重要)セキュリティ上の注意
絶対に一般公開（検索可能なところにURLをおかない）しないでください。
簡単のためログイン処理を簡略化していますので、セキュリティ上問題があります。

chatapi.jsで使われているapiのurl(エンドポイント）も絶対に公開しないでください。

chatapiの使い方はmain.jsおよびchatapi.jsを見るとわかると思います。

## ファイルのアップロード
api上はバイナリファイルのアップロードはサポートしていません．
Base64等でjsonに埋め込むことで対応可能かもしれません

## Messageのスキーマ
サーバ上で以下のように定義されています。
typeフィールドはシステムで利用しています。
datetimeには、投稿時の時刻が入ります。
sender_idは、投稿者のusernameです。
```
class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    room_name = Column(String(64), default=0, index=True)
    sender_id   = Column(String(64), nullable=True, index=True)
    reciever_id = Column(String(64), nullable=True, index=True)

    type = Column(String(8), default="")
    title = Column(String, default="")
    text = Column(String, default="")
    datetime = Column(DateTime, default=get_now())
    sender_username = Column(String(64), default="")
    state = Column(String(32), default="")
```
apiの仕様上は以下のフィールドをpost可能です。
```
class MessageReq(BaseModel):
    room_name : str
    reciever_id : str
    text : str

    title : str = "None"
    type : str = "None"
    state : str = "None"
```