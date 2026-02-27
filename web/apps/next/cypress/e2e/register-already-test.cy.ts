/*describe('Regisztráció űrlap e2e', () => {
  it('megnyitja a regisztrációt, kitölti és elküldi', () => {
    cy.visit('http://localhost:3000')
    cy.contains('a', 'Regisztráció').first().click()

    
    cy.get('form').should('be.visible').within(() => {
        
      cy.get('input').eq(0).clear().type('adddd')
      cy.get('input').eq(1).clear().type('Adam')
      cy.get('input').eq(2).clear().type('adamvad@gmail.com')
      cy.get('input').eq(3).clear().type('qweQWE123!')
      cy.get('input').eq(4).clear().type('qweQWE123!')

      cy.contains('button', 'Regisztráció').click()
    })
    cy.contains('Hiba a regisztráció során').should('be.visible')
  })
})*/