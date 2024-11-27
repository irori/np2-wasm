# np2-wasm

Webブラウザで動く[Neko Project II](http://www.yui.ne.jp/np2/)ベースのPC-9801 / PC-9821エミュレータです。

## デモ

https://irori.github.io/np2-wasm/

## 使用法

example.html:

```html
<!DOCTYPE html>
<html>
 <body>
  <canvas id="canvas"></canvas> <!-- 画面はこのcanvasに描画される -->
  <script type="module" src="example.js"></script>
 </body>
</html>
```

example.js:

```js
import { NP2, NP21 } from "https://unpkg.com/np2-wasm/dist/np2-wasm.js";

// canvasを指定してNP2のインスタンスを作成
const canvas = document.getElementById('canvas');
// i386エミュレーションが必要ならここを NP21.create() にする
const np2 = await NP2.create({ canvas });

// フロッピーディスクイメージのロード
const resp = await fetch('image.d88');
const data = new Uint8Array(await resp.arrayBuffer());
np2.addDiskImage('image.d88', data);

// FDドライブ0にディスクイメージをセット
np2.setFdd(0, 'image.d88');

// エミュレータを起動
np2.run();
```

## API
### NP2.create(config: NP2Config): Promise\<NP2>
新しい `NP2` のインスタンスを作成します。 `config` は以下の要素を持つオブジェクトです。

#### canvas: HTMLCanvasElement
エミュレータの画面を表示する `<canvas>` 要素です。

#### onDiskChange: (name: string) => void
ディスクイメージに書き込みが行われたときに呼ばれるコールバックです。
変更されたイメージは `getDiskImage()` メソッドで取得できます。

#### onExit: () => void
エミュレータの電源offが実行されたときに呼ばれるコールバックです。
終了後は`reset()`でエミュレータを再起動できます。

#### clk_base: number (default=2457600)
CPU スピードのベースクロック (Hz) を指定します。1996800 か 2457600 が指定できます。

#### clk_mult: number (default=4)
CPU スピードの倍率を決めます。実際の CPU スピードはこの値にベースクロックを掛けた物になります。

#### Latencys: number (default=250)
サウンドエミュレートの出力バッファサイズをミリ秒で指定します。20〜1000ms の間を指定してください。
値が少ないほどサウンドの延滞が短くなりますが、CPU パワーが必要になります。

#### use_menu: boolean (default=true)
マウスの中クリックかF11キーでNeko Project IIのメニューを表示します。

#### no_mouse: boolean (default=false)
マウスを無効にします。

### NP21.create(config: NP2Config): Promise\<NP21>
`NP2.create()` と同じですが、PC-9821エミュレータ `NP21` のインスタンスを作成します。

### state: 'ready' | 'running' | 'paused' | 'exited'
エミュレータの現在の状態を返します。

### run(): void
エミュレータを起動します。

### reset(): void
エミュレータをリセットします。

### addDiskImage(name: string, bytes: Uint8Array): void
エミュレータにディスクイメージを追加します。

### getDiskImage(name: string): Uint8Array
ディスクイメージの現在の内容を返します。

### setFdd(drive: number, name: string | null): void
エミュレータのフロッピーディスクドライブにディスクイメージをセットします。
`drive` はドライブ番号 (0 or 1)、`name` は `addDiskImage` に指定したディスク名です。

### setHdd(drive: number, name: string | null): void
エミュレータのハードディスクドライブにディスクイメージをセットします。
`drive` はドライブ番号 (0 or 1)、`name` は `addDiskImage` に指定したディスク名です。
`run()`実行後にこのメソッドが呼ばれた場合、`reset()`するまで効果は反映されません。