describe('Bejelentkezés e2e', () => {
  it('megnyitja a bejelentkezést, kitölti és belép (regisztrációnál használt adatokkal)', () => {
    cy.visit('http://localhost:3000')

    cy.contains('a', 'Bejelentkezés').first().click()
    
    cy.get('form').should('be.visible').within(() => {
      
      cy.get('input').eq(0).clear().type('test.user+demo@example.com')
      cy.get('input').eq(1).clear().type('Test1234!')
      cy.contains('button', 'Bejelentkezés').click()
    
    })
    cy.get('form').should('not.exist')
    cy.contains('Hibás bejelentkezés').should('be.visible')
  })
})