from flask import Flask, request, jsonify
import random
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing if your React app is served from a different port

@app.route('/api/get-move', methods=['POST'])
def get_move():
    data = request.get_json()
    game_id = data.get('gameId')
    board = data.get('board')
    move_order = data.get('moveOrder')

    # For now, pick a random column (0-6). You can add logic to only choose columns with empty spaces.
    move = random.randint(0, 6)

    print(f"Received move request for game {game_id} with move order {move_order}.")
    print(f"Board state: {board}")
    print(f"Returning move: {move}")

    return jsonify({'move': move})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
