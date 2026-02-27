/*describe('Regisztráció űrlap e2e', () => {
  it('megnyitja a regisztrációt, kitölti és elküldi', () => {
    cy.visit('http://localhost:3000')    
    cy.contains('a', 'Regisztráció').first().click()

   
    cy.get('form').should('be.visible').within(() => {

      cy.contains('div', 'Choose File').click({ force: true })
      cy.get('input[type="file"]', { timeout: 5000 }).selectFile('cypress/fixtures/images.jpg', { force: true })    
      cy.contains('button', 'Upload 1 file', { timeout: 5000 }).should('be.visible').click({ force: true })
    })
    cy.contains('Sikeres feltöltés').should('be.visible')
  })
})*/