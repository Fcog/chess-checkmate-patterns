export type Props = {
  full: string;
  /** Shown instead of `full` on narrow screens, so the controls fit on one line. */
  short: string;
};

export function ButtonLabel({ full, short }: Props) {
  return (
    <>
      <span className="label-full">{full}</span>
      <span className="label-short" aria-hidden="true">
        {short}
      </span>
    </>
  );
}
