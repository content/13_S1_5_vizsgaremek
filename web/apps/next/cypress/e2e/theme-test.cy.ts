describe('template spec', () => {
  it('clicks the target button', () => {
    cy.visit('http://localhost:3000/')
     cy.get('button.inline-flex.items-center.justify-center.gap-2.whitespace-nowrap.text-sm.font-medium').click().click()
  })
})