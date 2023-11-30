import style from './App.module.scss'

function Child() {
  return <span className={style.child}>index</span>
}

export default function App() {
  return (<div className={style.app}>Hello <Child /></div>)
}
