const actions = require('../src/actions')

// фабрика mock page
function createMockPage() {
  return {
    mouse: {
      move: jest.fn(),
      wheel: jest.fn(),
    },
    waitForTimeout: jest.fn().mockResolvedValue(),
    click: jest.fn().mockResolvedValue(),
    $: jest.fn(),
    $$: jest.fn(),
    evaluate: jest.fn().mockResolvedValue(),
  }
}

describe('actions.js', () => {
  test('humanScroll вызывает evaluate (скролл)', async () => {
    const page = createMockPage()

    await actions.humanScroll(page)

    expect(page.evaluate).toHaveBeenCalled()
  })

  test('nextPage кликает по последней странице', async () => {
    const page = createMockPage()

    const fakeHandle = {
      scrollIntoViewIfNeeded: jest.fn().mockResolvedValue(),
      click: jest.fn().mockResolvedValue(),
    }

    // вернём несколько страниц
    page.$$.mockResolvedValue([fakeHandle, fakeHandle, fakeHandle])

    await actions.nextPage(page)

    expect(fakeHandle.click).toHaveBeenCalled()
  })
})
