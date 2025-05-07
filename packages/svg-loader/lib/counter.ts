let counter = 0;

interface Counter {
  incr(): number;
  decr(): number;
  curr(): number;
}

const counterModule: Counter = {
  incr(): number {
    return ++counter;
  },

  decr(): number {
    return --counter;
  },

  curr(): number {
    return counter;
  },
};

export default counterModule;
