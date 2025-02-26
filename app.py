from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit
import random

app = Flask(__name__)
socketio = SocketIO(app)

GRID_SIZE = 20  # 20x20 grid
players = {}
colors = ["red", "blue", "green", "yellow", "purple", "orange", "cyan", "magenta"]

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('connect')
def handle_connect():
    player_id = request.sid  # Unique session ID
    x, y = random.randint(0, GRID_SIZE-1), random.randint(0, GRID_SIZE-1)
    color = random.choice(colors)
    players[player_id] = {'x': x, 'y': y, 'color': color}
    emit('player_data', players, broadcast=True)

@socketio.on('move')
def handle_move(data):
    player_id = request.sid
    if player_id in players:
        if data['direction'] == 'up' and players[player_id]['y'] > 0:
            players[player_id]['y'] -= 1
        elif data['direction'] == 'down' and players[player_id]['y'] < GRID_SIZE - 1:
            players[player_id]['y'] += 1
        elif data['direction'] == 'left' and players[player_id]['x'] > 0:
            players[player_id]['x'] -= 1
        elif data['direction'] == 'right' and players[player_id]['x'] < GRID_SIZE - 1:
            players[player_id]['x'] += 1
        emit('player_data', players, broadcast=True)

@socketio.on('disconnect')
def handle_disconnect():
    player_id = request.sid
    if player_id in players:
        del players[player_id]
        emit('player_data', players, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)
