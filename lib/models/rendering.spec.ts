import { Component, DebugElement, Directive, Type } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent, MockDirective } from 'ng-mocks';
import { Rendering } from './rendering';
import { TestSetup } from './test-setup';

@Component({
  template: '<outer></outer>',
})
class TestHostComponent {}

@Directive({
  selector: '[directive-to-mock]',
})
class DirectiveToMock {}

@Directive({
  selector: '[test-directive]',
})
class TestDirective {}

@Directive({
  selector: '[other-directive]',
})
class OtherDirective {}

@Component({
  selector: 'outer',
  template: `
    <div class="outer">
      <inner directive-to-mock></inner>
      <component-to-mock></component-to-mock>
      <other other-directive>one</other>
      <other other-directive>two</other>
    </div>
  `,
})
class OuterComponent {}

@Component({
  selector: 'inner',
  template: '<span test-directive>sub</span>',
})
class InnerComponent {}

@Component({
  selector: 'component-to-mock',
  template: '<span>this will not render<span>',
})
class ComponentToMock {}

@Component({
  selector: 'other',
  template: '<span>other</span>',
})
class OtherComponent {}

describe('Rendering', () => {
  let testSetup: TestSetup<OuterComponent>;
  let fixture: ComponentFixture<TestHostComponent>;
  let instance: ComponentToMock;
  let element: DebugElement;
  let MockedComponent: Type<ComponentToMock>;
  let MockedDirective: Type<DirectiveToMock>;

  beforeEach(async () => {
    MockedDirective = MockDirective(DirectiveToMock);
    MockedComponent = MockComponent(ComponentToMock);
    testSetup = new TestSetup(OuterComponent, class {});
    testSetup.mockCache.add(DirectiveToMock, MockedDirective);
    testSetup.mockCache.add(ComponentToMock, MockedComponent);
    return TestBed.configureTestingModule({
      declarations: [
        TestHostComponent,
        OuterComponent,
        OtherComponent,
        InnerComponent,
        TestDirective,
        OtherDirective,
        MockedComponent,
        MockedDirective,
      ],
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(TestHostComponent);
      fixture.detectChanges();
      element = fixture.debugElement.query(By.directive(OuterComponent));
      instance = element.componentInstance;
    });
  });

  describe('find', () => {
    it('can be destructured', () => {
      const {find} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(() => find('some-css-selector')).not.toThrowError();
    });

    it('throws an error when used to find the test component by CSS', () => {
      const {find} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(() => find('outer')).toThrow();
    });

    it('does not throw an error when used to find an inner element of the test component', () => {
      const {find} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(() => find('div.outer')).not.toThrow();
    });

    it('throws an error when used to find the test component by Directive', () => {
      const {find} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(() => find(OuterComponent)).toThrow();
    });

    it('can find things by CSS', () => {
      const {find} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find('inner')).toHaveFound(1);
    });

    it('can find by Component', () => {
      const {find} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find(InnerComponent)).toHaveFound(1);
    });

    it('finds by mocked Components', () => {
      const {find} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find(ComponentToMock)).toHaveFound(1);
    });

    it('can find by Directive', () => {
      const {find} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find(InnerComponent)).toHaveFound(1);
    });

    it('finds by mocked directives', () => {
      const {find} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find(DirectiveToMock)).toHaveFound(1);
    });

    it('returns an empty query match when no matches found', () => {
      const {find} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find('will-not-be-found')).toHaveFound(0);
    });

    it('returns a QueryMatch when a match is found', () => {
      const {find} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(find('inner')).toHaveFound(1);
      expect(find('inner').nativeElement).toBeDefined();
    });
  });

  describe('findComponent', () => {
    it('can be destructured', () => {
      const {findComponent} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(() => findComponent(InnerComponent)).not.toThrow();
    });

    it('finds components', () => {
      const {findComponent} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(findComponent(InnerComponent) instanceof InnerComponent).toBe(true);
    });

    it('finds mocked components', () => {
      const {findComponent} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(findComponent(ComponentToMock) instanceof MockedComponent).toBe(true);
    });

    it('finds multiple components', () => {
      const {findComponent} = new Rendering(fixture, element, instance, {}, testSetup);

      const found = findComponent(OtherComponent);
      expect(found).toHaveFound(2);
      found.forEach(i => expect(i instanceof OtherComponent).toBe(true));
    });
  });

  describe('findDirective', () => {
    it('can be destructured', () => {
      const {findDirective} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(() => findDirective(TestDirective)).not.toThrow();
    });

    it('finds directives', () => {
      const {findDirective} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(findDirective(TestDirective) instanceof TestDirective).toBe(true);
    });

    it('finds mocked directives', () => {
      const {findDirective} = new Rendering(fixture, element, instance, {}, testSetup);

      expect(findDirective(DirectiveToMock) instanceof MockDirective(DirectiveToMock)).toBe(true);
    });

    it('finds multiple directives', () => {
      const {findDirective} = new Rendering(fixture, element, instance, {}, testSetup);

      const found = findDirective(OtherDirective);
      expect(found).toHaveFound(2);
      found.forEach(i => expect(i instanceof OtherDirective).toBe(true));
    });
  });

  describe('get', () => {
    it('returns the result of TestBed.get', () => {
      const {get} = new Rendering(fixture, element, instance, {}, testSetup);
      spyOn(TestBed, 'get').and.returnValue('foo');

      class QueryClass {}
      expect(get(QueryClass)).toBe('foo');
    });
  });

  describe('bindings object', () => {
    it('is returned', () => {
      const inputBindings = {};
      const {bindings} = new Rendering(fixture, element, instance, inputBindings, testSetup);

      expect(bindings).toBe(inputBindings);
    });
  });

  describe('test component instance', () => {
    it('is returned', () => {
      const rendering = new Rendering(fixture, element, instance, {}, testSetup);

      expect(rendering.instance).toBe(instance);
    });
  });
});
