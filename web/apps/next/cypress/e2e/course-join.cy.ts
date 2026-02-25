describe('template spec', () => {
  it('passes', () => {
    cy.visit('https://example.cypress.io')
  });

  it('course', function() {
    cy.visit('http://localhost:3000/login')
    
    cy.get('#email').click();
    cy.get('#email').type('adamvad3@gmail.com');
    cy.get('#password').type('qweQWE123!');
    cy.get('button.w-full').click();
    cy.get('button').contains('Csatlakozz egy kurzushoz').click();
    cy.get('#course-code').type('E09C-A1QZ');
    cy.get('button').contains("Csatlakozás").click();

  })
});
    