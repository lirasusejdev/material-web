/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import 'jasmine';

import {ReactiveElement, render as litRender, TemplateResult} from 'lit';

/**
 * Test environment setup for screenshot tests.
 */
export class Environment {
  /**
   * An array of root containers for rendering screenshot test elements.
   */
  private readonly roots: HTMLElement[] = [];

  constructor() {
    afterAll(() => {
      for (const root of this.roots) {
        root.style.display = 'inline-flex';
      }
    });
  }

  /**
   * Waits for stability on the page to prevent flaky-ness tests. Use this if
   * waiting for an API that uses `requestAnimationFrame()` or when waiting for
   * a Lit element to render.
   */
  async waitForStability() {
    await new Promise(resolve => {
      requestAnimationFrame(resolve);
    });

    if (!this.roots.length) {
      return;
    }

    const currentRoot = this.roots[this.roots.length - 1];
    await this.waitForLitRender(currentRoot);
  }

  /**
   * Waits for all Lit `ReactiveElement` children of the given parent node to
   * finish rendering.
   *
   * @param root a parent node to wait for rendering on.
   */
  private async waitForLitRender(root: ParentNode) {
    for (const element of root.querySelectorAll('*')) {
      if (this.isReactiveElement(element)) {
        await element.updateComplete;
        await this.waitForLitRender(element.renderRoot);
      }
    }
  }

  /**
   * Tests if an element is a Lit `ReactiveElement`.
   *
   * @param element the element to test.
   * @return true if the element is a `ReactiveElement`.
   */
  private isReactiveElement(element: Element): element is ReactiveElement {
    return Boolean((element as ReactiveElement).updateComplete);
  }

  /**
   * Render a Lit template in the environment's root container.
   *
   * @param template a Lit `TemplateResult` to render.
   */
  render(template: TemplateResult) {
    litRender(template, this.createNewRoot());
  }

  /**
   * Creates a new root container for screenshot rendering and adds it to the
   * body.
   *
   * Previous root containers will be hidden and displayed at the end of
   * testing for easier debugging.
   *
   * @return A new root container.
   */
  private createNewRoot() {
    if (this.roots.length) {
      const currentRoot = this.roots[this.roots.length - 1];
      currentRoot.id = '';
      currentRoot.style.display = 'none';
    }

    const root = document.createElement('div');
    root.id = 'root';
    root.style.display = 'inline-flex';
    document.body.appendChild(root);
    this.roots.push(root);
    return root;
  }
}
