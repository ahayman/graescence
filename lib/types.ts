export type StaticProps<T> = { props: T }
export type StaticParam<T> = {
  params: T
}

export type ReducerAction<Type extends String, Data extends {} = {}> = { type: Type } & Data
