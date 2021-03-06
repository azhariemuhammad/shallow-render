import { Component, Directive, ModuleWithProviders, Pipe, PipeTransform, NgModule } from '@angular/core';
import { ngMock } from './ng-mock';
import { TestSetup } from '../models/test-setup';
import * as mockModuleLib from './mock-module';
import * as ngMocksLib from 'ng-mocks';

@Component({
  template: '<label>foo</label>'
})
class FooComponent {}

@Directive({
  selector: '[foo]'
})
class FooDirective {}

@Pipe({name: 'foo'})
class FooPipe implements PipeTransform {
  transform(input: string) {
    return `${input} piped to foo`;
  }
}

@NgModule({
  declarations: [FooComponent, FooDirective, FooPipe]
})
class FooModule {}

describe('ng-mock', () => {
  let  testSetup: TestSetup<any>;

  beforeEach(() => {
    testSetup = new TestSetup(class {}, class {});
  });

  it('uses cached mocks instead of re-mocking components', () => {
    spyOn(ngMocksLib, 'MockDeclaration').and.returnValues('FIRST', 'SECOND');
    ngMock(FooComponent, testSetup);
    const mockedSecond = ngMock(FooComponent, testSetup);

    expect(mockedSecond).toBe('FIRST' as any);
  });

  it('throws a friendly message when mocking fails', () => {
    class BadComponent {}
    spyOn(ngMocksLib, 'MockDeclaration').and.throwError('BOOM');

    expect(() => ngMock(BadComponent, testSetup))
      .toThrowError(/Shallow.*BadComponent[\s\S]*BOOM/g);
  });

  it('mocks a component', () => {
    spyOn(ngMocksLib, 'MockDeclaration').and.returnValue('MOCKED');
    const mocked = ngMock(FooComponent, testSetup);

    expect(mocked).toBe('MOCKED' as any);
  });

  it('mocks a directive', () => {
    spyOn(ngMocksLib, 'MockDeclaration').and.returnValue('MOCKED');
    const mocked = ngMock(FooDirective, testSetup);

    expect(mocked).toBe('MOCKED' as any);
  });

  it('mocks a pipe', () => {
    spyOn(ngMocksLib, 'MockPipe').and.returnValue('MOCKED');
    const mocked = ngMock(FooPipe, testSetup);

    expect(mocked).toBe('MOCKED' as any);
  });

  it('mocks a pipe with user-provided pipe transforms', () => {
    testSetup.mockPipes.set(FooPipe, () => 'MOCKED TRANSFORM');
    const mocked = ngMock(FooPipe, testSetup) as any;

    expect(new mocked().transform()).toBe('MOCKED TRANSFORM');
  });

  it('mocks modules', () => {
    spyOn(mockModuleLib, 'mockModule').and.returnValue('MOCKED');
    const mocked = ngMock(FooModule, testSetup);

    expect(mocked).toBe('MOCKED' as any);
  });

  it('mocks modules with providers', () => {
    spyOn(mockModuleLib, 'mockModule').and.returnValue('MOCKED');
    class FooService {}

    const moduleWithProviders: ModuleWithProviders = {
      ngModule: FooModule,
      providers: [FooService]
    };

    const mocked = ngMock(moduleWithProviders, testSetup) as any;

    expect(mocked).toBe('MOCKED');
  });

  it('mocks arrays of things', () => {
    spyOn(ngMocksLib, 'MockDeclaration').and.returnValue('DECLARATION');
    spyOn(ngMocksLib, 'MockPipe').and.returnValue('PIPE');
    spyOn(mockModuleLib, 'mockModule').and.returnValue('MODULE');
    const mocked = ngMock(
      [
        FooComponent,
        FooDirective,
        FooPipe,
        FooModule,
      ],
      testSetup
    ) as any;

    expect(mocked).toEqual(['DECLARATION', 'DECLARATION', 'PIPE', 'MODULE']);
  });
});
