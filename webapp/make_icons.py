"""
アイコン画像を生成するスクリプト
実行: python make_icons.py
"""
import struct, zlib, os

def make_png(size):
    """温泉マーク入りのシンプルなPNGを生成する"""
    # SVGをPNGに変換（Pillowなしで動くシンプル実装）
    # ここでは単色の赤い正方形PNGを生成します
    # （本番では好みのアイコン画像を icons/ に置き換えてください）

    def write_chunk(chunk_type, data):
        chunk_len = len(data)
        chunk_data = chunk_type + data
        crc = zlib.crc32(chunk_data) & 0xffffffff
        return struct.pack('>I', chunk_len) + chunk_data + struct.pack('>I', crc)

    # RGBAデータを作成（赤背景 + 白い♨文字は入れられないのでシンプルに）
    r, g, b, a = 153, 27, 27, 255  # #991b1b

    raw_rows = []
    for y in range(size):
        row = b'\x00'  # filter type
        for x in range(size):
            # 丸く見せるためのマスク
            cx = x - size/2
            cy = y - size/2
            if (cx*cx + cy*cy) <= (size/2 * size/2):
                row += bytes([r, g, b, a])
            else:
                row += bytes([0, 0, 0, 0])
        raw_rows.append(row)

    compressed = zlib.compress(b''.join(raw_rows))

    png  = b'\x89PNG\r\n\x1a\n'
    png += write_chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 6, 0, 0, 0))
    png += write_chunk(b'IDAT', compressed)
    png += write_chunk(b'IEND', b'')
    return png

os.makedirs('icons', exist_ok=True)

with open('icons/icon-192.png', 'wb') as f:
    f.write(make_png(192))
print('icons/icon-192.png を作成しました')

with open('icons/icon-512.png', 'wb') as f:
    f.write(make_png(512))
print('icons/icon-512.png を作成しました')

print('完了！')
