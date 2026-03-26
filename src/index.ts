
import { Dispatcher } from './dispatcher';

const gateway = new Dispatcher();
const PORT = 3000;

gateway.start(PORT);