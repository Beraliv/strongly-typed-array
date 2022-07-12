import { AnyArray } from "./types/AnyArray";
import { ElementOf } from "./types/ElementOf";
import { ToTuple } from "./types/ToTuple";

type Map<T, U> = any[] extends T
  ? U[]
  : T extends [any, ...infer Tail]
  ? [U, ...Map<Tail, U>]
  : [];

type Shift<T extends AnyArray> = T extends [any, ...infer Tail]
  ? Tail
  : TupleToArray<T>;

type IsTuple<T> = any[] extends T ? false : true;

type ParallelShift<T extends AnyArray, U extends AnyArray> = [] extends U
  ? IsTuple<T> extends true
    ? T[0]
    : T[0] | undefined
  : ParallelShift<Shift<T>, Shift<U>>;

type Pop<T extends AnyArray> = T extends [...infer Head, any]
  ? Head
  : TupleToArray<T>;

type ParallelPop<T extends AnyArray, U extends AnyArray> = [] extends U
  ? IsTuple<T> extends true
    ? T[0]
    : T[0] | undefined
  : ParallelPop<Pop<T>, Pop<U>>;

type Get<T extends AnyArray, N extends string> = N extends `-${infer M}`
  ? ParallelPop<[ElementOf<T>, ...T, ElementOf<T>], ToTuple<ElementOf<T>, M>>
  : N extends `${number}`
  ? ParallelShift<T, ToTuple<ElementOf<T>, N>>
  : never;

type TupleToArray<T extends AnyArray> = ElementOf<T>[];

type LengthComparison = `>= ${number}`;

type ExtractLength<S extends LengthComparison> = S extends `>= ${infer N}`
  ? `${N}`
  : `${number}`;

class StronglyTypedArray<T extends AnyArray> {
  #items: T;

  constructor(items: T) {
    this.#items = items;
  }

  length<S extends LengthComparison>(
    condition: S,
    orThrows: () => Error
  ): StronglyTypedArray<ToTuple<ElementOf<T>, ExtractLength<S>>> {
    const expectedLength = Number(condition.split(" ")[1]);

    if (this.#items.length >= expectedLength) {
      return this as unknown as StronglyTypedArray<
        ToTuple<ElementOf<T>, ExtractLength<S>>
      >;
    }

    throw orThrows();
  }

  at<N extends number, S extends string = `${N}`>(index: N): Get<T, S> {
    return this.#items[index];
  }

  map<U>(
    callback: (value: ElementOf<T>, index: number) => U
  ): StronglyTypedArray<Map<T, U>> {
    // @ts-expect-error: T => U
    this.#items = this.#items.map(callback);
    // @ts-expect-error: StronglyTypedArray<T> => StronglyTypedArray<U>
    return this;
  }

  toArray(): T {
    return this.#items;
  }
}

export const sta = <T extends AnyArray>(
  items: [...T]
): StronglyTypedArray<[...T]> => new StronglyTypedArray(items);

export default sta;
export type { StronglyTypedArray };
