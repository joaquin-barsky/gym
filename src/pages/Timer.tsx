import TimerView from '../components/TimerView'
import { Header } from '../components/ui'
import { Item, Stagger } from '../components/motion'

export default function Timer() {
  return (
    <Stagger>
      <Item><Header title="Descanso" subtitle="Entre series" /></Item>
      <Item className="px-5"><TimerView /></Item>
    </Stagger>
  )
}
