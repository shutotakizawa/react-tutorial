import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'

/**
 * クラスベースのコンポーネント
 */
// class Square extends React.Component {
//     render() {
//         return (
//         <button
//             className="square"
//             onClick={() => {
//                 this.props.onClick()
//             }}
//         >
//             {this.props.value}
//         </button>
//         );
//     }
// }

/**
 * 関数ベースのコンポーネント
 */
function Square (props) {
    return (
        <button
            className={`square ${props.isHi ? 'hi' : ''}`}
            onClick={props.onClick}
        >
            {props.value}
        </button>
    )
}
  
class Board extends React.Component {
    renderSquare(i, isHi = false) {
        return (
            <Square
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
                key={i}
                isHi={isHi}
            />
        )
    }

    render() {
        return (
            <div>
                {
                    Array(3).fill(0).map((row, i) => {
                        return (
                            <div className='board-row' key={i}>
                                {
                                    Array(3).fill(0).map((col, j) => {
                                        return (
                                            this.renderSquare(i * 3 + j,
                                            this.props.highlightCells.indexOf(i * 3 + j) !== -1)
                                        )
                                    })
                                }
                            </div>
                        )
                    })
                }
            </div>
        );
    }
}

class Game extends React.Component {
    constructor (props) {
        super(props)
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
            isAsc: true,
        }
    }

    handleClick (i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1)
        const current = history[history.length -1]
        // sliceする理由は様々な理由があるけど、レンダリングのタイミングを限定するためなど
        // 詳しくは、Reactのチュートリアル内に記載している
        const squares = current.squares.slice()
        if (calculateWinner(squares) || squares[i]) {
            return
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O'
        this.setState({
            history: history.concat([{
                squares: squares,
                col: (i % 3) + 1,
                row: Math.floor(i / 3) + 1,
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        })
    }

    jumpTo (step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
        })
    }

    toggleAsc () {
        this.setState({
            isAsc: !this.state.isAsc,
        })
    }

    render() {
        const history = this.state.history
        const current = history[this.state.stepNumber]
        const settlement = calculateWinner(current.squares)

        const moves = history.map((step, move) => {
            const desc = move ?
            'Go to move #' + move + '(' + step.col + ',' + step.row + ')':
            'Go to game start'

            return (
                <li key={move}>
                    <button onClick={() => this.jumpTo(move)} className={this.state.stepNumber === move ? 'bold' : ''}>{desc}</button>
                </li>
            )
        })

        let status
        if (settlement) {
            if (settlement.isDraw) {
                status = 'Draw'
            } else {
                status = 'Winner: ' + settlement.winner
            }
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X': 'O')
        }
        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        onClick={i => this.handleClick(i)}
                        highlightCells={settlement ? settlement.line : []}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div><button onClick={() => this.toggleAsc()}>ASC-DESC</button></div>
                    <ol>{this.state.isAsc ? moves : moves.reverse()}</ol>
                </div>
        </div>
        );
    }
}
  
// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);

function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                isDraw: false,
                winner: squares[a],
                line: [a, b, c],
            }
        }
    }

    if (squares.filter(e => !e).length === 0) {
        return {
            isDraw: true,
            winner: null,
            line: [],
        }
    }
    return null;
}