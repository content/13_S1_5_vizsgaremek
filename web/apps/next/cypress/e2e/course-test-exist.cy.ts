describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  });

  it('course', function() {
    cy.visit('http://localhost:3000/login')
    
    cy.get('#email').click();
    cy.get('#email').type('adamvad@gmail.com');
    cy.get('#password').type('qweQWE123!');
    cy.get('button.w-full').click();

    cy.get('#radix-«r3»').click();
    cy.get('#radix-«r4» > div:nth-child(2)').click();
    cy.get('#course-name').type('Egy teszt poszt');

    cy.contains('div', 'Choose File').click({ force: true })
    cy.get('input[type="file"]', { timeout: 5000 }).selectFile('cypress/fixtures/images.jpg', { force: true })    
    cy.contains('button', 'Upload 1 file', { timeout: 5000 }).should('be.visible').click({ force: true })
    cy.contains('Sikeres feltöltés').should('be.visible')


    cy.get('button').contains('Kurzus létrehozása').click();
    cy.get('a[href="/dashboard/4"]').click(); //Lehet cserelni kell majd
    
      })
  });