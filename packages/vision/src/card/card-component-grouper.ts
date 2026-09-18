import type {
  CardComponent
} from "./card-component.js";

import type {
  CardRegion
} from "./types.js";

export interface CardComponentGrouperOptions {
  maxHorizontalGap?: number;
  maxVerticalGap?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export class CardComponentGrouper {
  private readonly maxHorizontalGap: number;
  private readonly maxVerticalGap: number;
  private readonly maxWidth: number;
  private readonly maxHeight: number;

  constructor(
    options: CardComponentGrouperOptions = {}
  ) {
    this.maxHorizontalGap =
      options.maxHorizontalGap ?? 10;

    this.maxVerticalGap =
      options.maxVerticalGap ?? 10;

    this.maxWidth =
      options.maxWidth ?? Infinity;

    this.maxHeight =
      options.maxHeight ?? Infinity;
  }

  group(
    components: CardComponent[]
  ): CardRegion[] {
    const groups: CardComponent[][] = [];

    for (const component of components) {
      const group =
        groups.find(
          (candidate) =>
            this.belongsToGroup(
              component,
              candidate
            )
        );

      if (group) {
        group.push(component);
      } else {
        groups.push([
          component
        ]);
      }
    }

    return groups.map(
      (group) =>
        this.toRegion(group)
    );
  }

  private belongsToGroup(
    component: CardComponent,
    group: CardComponent[]
  ): boolean {
    const isClose =
      group.some(
        (existing) =>
          this.areClose(
            component,
            existing
          )
      );

    if (!isClose) {
      return false;
    }

    const candidateRegion =
      this.toRegion([
        ...group,
        component
      ]);

    return (
      candidateRegion.width <=
      this.maxWidth &&
      candidateRegion.height <=
      this.maxHeight
    );
  }

  private areClose(
    first: CardComponent,
    second: CardComponent
  ): boolean {
    const firstRight =
      first.x +
      first.width;

    const secondRight =
      second.x +
      second.width;

    const firstBottom =
      first.y +
      first.height;

    const secondBottom =
      second.y +
      second.height;

    const horizontalGap =
      Math.max(
        0,
        Math.max(
          first.x,
          second.x
        ) -
        Math.min(
          firstRight,
          secondRight
        )
      );

    const verticalGap =
      Math.max(
        0,
        Math.max(
          first.y,
          second.y
        ) -
        Math.min(
          firstBottom,
          secondBottom
        )
      );

    return (
      horizontalGap <=
      this.maxHorizontalGap &&
      verticalGap <=
      this.maxVerticalGap
    );
  }

  private toRegion(
    components: CardComponent[]
  ): CardRegion {
    const minX =
      Math.min(
        ...components.map(
          (component) =>
            component.x
        )
      );

    const minY =
      Math.min(
        ...components.map(
          (component) =>
            component.y
        )
      );

    const maxX =
      Math.max(
        ...components.map(
          (component) =>
            component.x +
            component.width
        )
      );

    const maxY =
      Math.max(
        ...components.map(
          (component) =>
            component.y +
            component.height
        )
      );

    return {
      x: minX,
      y: minY,
      width:
        maxX - minX,
      height:
        maxY - minY
    };
  }
}