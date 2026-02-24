describe('Login -> Regisztráció link', () => {
  it('a /login oldalról rákattint a Regisztrálj! linkre és átvisz /register-re', () => {
    cy.visit('http://localhost:3000/login')

    cy.get('form', { timeout: 5000 }).should('be.visible')
    cy.contains('a', 'Regisztrálj!', { timeout: 5000 }).should('be.visible').click()
    cy.url({ timeout: 5000 }).should('include', '/register')
    cy.location('pathname').should('eq', '/register')
    cy.contains(/Regisztráció|Regisztráljon/i, { timeout: 5000 }).should('be.visible')
  })
})