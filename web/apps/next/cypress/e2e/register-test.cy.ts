describe('Regisztráció űrlap e2e', () => {
  it('megnyitja a regisztrációt, kitölti és elküldi', () => {
    cy.visit('http://localhost:3000')    
    cy.contains('a', 'Regisztráció').first().click()

   
    cy.get('form').should('be.visible').within(() => {
     
      cy.get('input').eq(0).clear().type('Fülöp')
      cy.get('input').eq(1).clear().type('Miklós János')
      cy.get('input').eq(2).clear().type('test.user+demo@example.com')
      cy.get('input').eq(3).clear().type('Test1234!')
      cy.get('input').eq(4).clear().type('Test1234!')

      cy.contains('button', 'Regisztráció').click()
    })
    cy.contains('Sikeres regisztráció').should('be.visible')
  })
})