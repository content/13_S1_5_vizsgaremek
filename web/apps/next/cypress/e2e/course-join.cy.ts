describe('template spec', () => {

  it('course', function() {
    cy.visit('http://localhost:3000/login')
    
    cy.get('#email').click();
    cy.get('#email').type('vadkerti-toth.adam@diak.szbi-pg.hu'); 
    cy.get('#password').type('qweQWE123!');
    cy.get('button.w-full').click();
    cy.get('button').contains('Csatlakozz egy kurzushoz').click();
    cy.get('#course-code').type('E09C-A1QZ'); //Lehet cserelni kell majd a kodot
    cy.get('button').contains("Csatlakozás").click();

  })
});
    