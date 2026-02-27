describe('Regisztráció űrlap e2e', () => {
  it('megnyitja a regisztrációt, kitölti és elküldi', () => {
    cy.visit('http://localhost:3000')    
    cy.contains('a', 'Regisztráció').first().click()
    cy.get('form').should('be.visible').within(() => {
      cy.get('input').eq(0).clear().type( 'adddd')
      cy.get('input').eq(1).clear().type('Adam')
      cy.get('input').eq(2).clear().type('vadkerti-toth.adam@diak.szbi-pg.hu')

      cy.contains('button', 'Regisztráció').click()
      cy.visit('https://mail.google.com/mail/u/1/#inbox')
      const subjectText = 'Studify - Email cím megerősítése'
      cy.contains(subjectText, { timeout: 30000 }).should('be.visible').click({ force: true })
      cy.contains('a', 'Email megerősítése', { timeout: 20000 })
        .should('be.visible')
        .then($a => {
          const href = $a.prop('href')
          if (href) {
            cy.visit(href)
          } else {
            cy.wrap($a).click({ force: true })
          }
        })
    })
    cy.contains('Email cím sikeresen megerősítve', { timeout: 10000 }).should('be.visible')
      cy.contains('Jelszó', { timeout: 10000 }).should('be.visible')
      cy.get('input[type="password"]').eq(0).clear().type('qweQWE123!')
      cy.get('input[type="password"]').eq(1).clear().type('qweQWE123!')
      cy.contains('button', 'Tovább').click()
      cy.contains('div', 'Choose File').click({ force: true })
      cy.get('input[type="file"]', { timeout: 5000 }).selectFile('cypress/fixtures/images.jpg', { force: true })    
      cy.contains('button', 'Upload 1 file', { timeout: 5000 }).should('be.visible').click({ force: true })

       cy.contains('a', 'Regisztráció').first().click()
  })
})